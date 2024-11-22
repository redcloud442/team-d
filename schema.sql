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
   `,['MEMBER','be59a796-50c6-4c41-8925-93631734a848',userId])[0].alliance_member_id;


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
