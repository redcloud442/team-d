

DELETE FROM storage.buckets;

CREATE POLICY buckets_policy ON storage.buckets FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name) VALUES ('REQUEST_ATTACHMENTS', 'REQUEST_ATTACHMENTS');

UPDATE storage.buckets SET public = true;

CREATE OR REPLACE FUNCTION create_user_trigger(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData;
plv8.subtransaction(function() {
  const {
    email,
    password,
    userId,
    referalLink,
    url
  } = input_data;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  const referalId = plv8.execute(`SELECT gen_random_uuid()`)[0].gen_random_uuid;

  const insertQuery = `
    INSERT INTO user_schema.user_table (user_id, user_email, user_password)
    VALUES ($1, $2, $3)
    RETURNING user_id, user_email
  `;
   const result = plv8.execute(insertQuery, [userId,email, password]);

   if(!result) return;


   const allianceData = plv8.execute(`
    INSERT INTO alliance_schema.alliance_member_table (alliance_member_role, alliance_member_alliance_id, alliance_member_user_id)
    VALUES ($1, $2, $3)
    RETURNING alliance_member_id
   `,['MEMBER','35f77cd9-636a-41fa-a346-9cb711e7a338',userId])[0].alliance_member_id;


  const insertReferalQuery = `
    INSERT INTO alliance_schema.alliance_referral_link_table (alliance_referral_link_id, alliance_referral_link, alliance_referral_link_member_id)
    VALUES ($1, $2, $3)
    `;

  const linkForReferal = `${url}?referalLink=${referalId}`
  plv8.execute(insertReferalQuery, [referalId, linkForReferal, allianceData]);

  if(referalLink){
    const checkIfReferalIsTen = plv8.execute(`
        SELECT COUNT(*)
        FROM alliance_schema.alliance_referral_table ur
        JOIN alliance_schema.alliance_referral_link_table rl
        ON ur.alliance_referral_link_id = rl.alliance_referral_link_id
        WHERE user_referral_link_id = $1
    `,[referalLink])[0].count;

    const checkIfReffered = plv8.execute(`
        SELECT *
        FROM alliance_schema.alliance_referral_table
        WHERE alliance_referral_member_id = $1
    `,[referalLink])[0].alliance_referral_from_member_id;

    let referralType = 'INDIRECT';

    if (checkIfReferalExists === 0) {
      referralType = 'DIRECT';
    }

    if(checkIfReferalIsTen < 10){
        plv8.execute(`
            INSERT INTO alliance_schema.alliance_referral_table (
            alliance_referral_member_id,
            alliance_referral_link_id,
            alliance_referral_type,
            alliance_referral_from_member_id
            ) VALUES ($1, $2, $3, COALESCE($4, NULL))
        `, [allianceData, referalLink, referralType, checkIfReferred]);
    }
  }

  if (result.length === 0) {
    throw new Error('Failed to create user');
  }

  returnData = {
    success: true,
    user: result[0]
  };
});
$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION create_top_up_request(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData;

plv8.subtransaction(function() {
  const {
    TopUpFormValues,
    teamMemberId
  } = input_data;

  if (!TopUpFormValues) {
    throw new Error('TopUpFormValues is required');
  }

  const { amount, topUpMode, accountName, accountNumber, fileUrl } = TopUpFormValues;

  if (!amount || !topUpMode || !accountName || !accountNumber || !teamMemberId) {
    throw new Error('All fields (amount, topUpMode, accountName, accountNumber, and teamMemberId) are required');
  }

  const topUpRequest = plv8.execute(`
    INSERT INTO alliance_schema.alliance_top_up_request_table (
      alliance_top_up_request_amount,
      alliance_top_up_request_type,
      alliance_top_up_request_name,
      alliance_top_up_request_account,
      alliance_top_up_request_attachment,
      alliance_top_up_request_member_id
    ) VALUES ($1, $2, $3, $4,$5,$6)
    RETURNING alliance_top_up_request_id
  `, [amount, topUpMode, accountName, accountNumber,fileUrl, teamMemberId]);

  returnData = {
    success: true,
  };
});
return returnData;
$$ LANGUAGE plv8;



GRANT ALL ON ALL TABLES IN SCHEMA user_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA user_schema TO POSTGRES;
GRANT ALL ON SCHEMA user_schema TO postgres;
GRANT ALL ON SCHEMA user_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA alliance_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA alliance_schema TO POSTGRES;
GRANT ALL ON SCHEMA alliance_schema TO postgres;
GRANT ALL ON SCHEMA alliance_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA packages_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA packages_schema TO POSTGRES;
GRANT ALL ON SCHEMA packages_schema TO postgres;
GRANT ALL ON SCHEMA packages_schema TO public;
