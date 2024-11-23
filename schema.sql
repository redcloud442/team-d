

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

  plv8.execute(`
    INSERT INTO alliance_schema.alliance_earnings_table
    (alliance_earnings_member_id)
    VALUES ($1)
  `,[allianceData]);

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


CREATE OR REPLACE FUNCTION get_admin_top_up_history(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = {
    data:[],
    totalCount:0
};
plv8.subtransaction(function() {
  const {
    page = 1,
    limit = 13,
    search = '',
    teamMemberId,
    teamId
  } = input_data;

  const member = plv8.execute(`
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
  `, [teamMemberId]);

  if (!member.length || member[0].alliance_member_role !== 'ADMIN') {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const offset = (page - 1) * limit;

  let searchCondition = '';
  const params = [teamId, limit, offset];
  if (search) {
    searchCondition = 'AND u.user_email ILIKE $4';
    params.push(`%${search}%`);
  }

  const topUpRequest = plv8.execute(`
    SELECT
      u.user_first_name,
      u.user_last_name,
      u.user_email,
      m.alliance_member_id
    FROM alliance_schema.alliance_top_up_request_table t
    JOIN alliance_schema.alliance_member_table m
      ON t.alliance_top_up_request_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
      ON u.user_id = m.alliance_member_user_id
    WHERE m.alliance_member_alliance_id = $1
    ${searchCondition}
    LIMIT $2 OFFSET $3
  `, params);

    const totalCount = plv8.execute(`
        SELECT
            COUNT(*)
        FROM alliance_schema.alliance_top_up_request_table t
        JOIN alliance_schema.alliance_member_table m
        ON t.alliance_top_up_request_member_id = m.alliance_member_id
        JOIN user_schema.user_table u
        ON u.user_id = m.alliance_member_user_id
        WHERE m.alliance_member_alliance_id = $1
        ${searchCondition}
  `,[teamId])[0].count;

  returnData.data = topUpRequest;
  returnData.totalCount = Number(totalCount);
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_member_withdrawal_history(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = {
    data:[],
    totalCount:0
};
plv8.subtransaction(function() {
  const {
    page = 1,
    limit = 13,
    search = '',
    teamMemberId,
    teamId,
    columnAccessor,
    isAscendingSort
  } = input_data;

  const member = plv8.execute(`
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
  `, [teamMemberId]);

  if (!member.length || member[0].alliance_member_role !== 'MEMBER') {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const offset = (page - 1) * limit;

  const params = [teamId,teamMemberId, limit, offset];

  const searchCondition = search ? `AND t.alliance_withdrawal_request_id = '${search}'`: "";
  const sortBy = isAscendingSort ? "desc" : "asc";
  const sortCondition = columnAccessor
    ? `ORDER BY "${columnAccessor}" ${sortBy}`
    : "";

  const topUpRequest = plv8.execute(`
    SELECT
      u.user_first_name,
      u.user_last_name,
      u.user_email,
      m.alliance_member_id,
      t.*
    FROM alliance_schema.alliance_withdrawal_request_table t
    JOIN alliance_schema.alliance_member_table m
      ON t.alliance_withdrawal_request_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
      ON u.user_id = m.alliance_member_user_id
    WHERE m.alliance_member_alliance_id = $1 AND
    t.alliance_withdrawal_request_member_id = $2
    ${searchCondition}
    ${sortCondition}
    LIMIT $3 OFFSET $4
  `, params);

    const totalCount = plv8.execute(`
        SELECT
            COUNT(*)
        FROM alliance_schema.alliance_withdrawal_request_table t
        JOIN alliance_schema.alliance_member_table m
        ON t.alliance_withdrawal_request_member_id = m.alliance_member_id
        JOIN user_schema.user_table u
        ON u.user_id = m.alliance_member_user_id
        WHERE m.alliance_member_alliance_id = $1 AND
        t.alliance_withdrawal_request_member_id = $2
        ${searchCondition}
  `,[teamId,teamMemberId])[0].count;

  returnData.data = topUpRequest;
  returnData.totalCount = Number(totalCount);
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_admin_withdrawal_history(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = {
    data:[],
    totalCount:0
};
plv8.subtransaction(function() {
  const {
    page = 1,
    limit = 13,
    search = '',
    teamMemberId,
    teamId,
    columnAccessor,
    isAscendingSort
  } = input_data;

  const member = plv8.execute(`
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
  `, [teamMemberId]);

  if (!member.length || member[0].alliance_member_role !== 'ADMIN') {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const offset = (page - 1) * limit;

  const params = [teamId, limit, offset];

  const searchCondition = search ? `AND t.alliance_withdrawal_request_id = '${search}'`: "";
  const sortBy = isAscendingSort ? "desc" : "asc";
  const sortCondition = columnAccessor
    ? `ORDER BY "${columnAccessor}" ${sortBy}`
    : "";

  const topUpRequest = plv8.execute(`
    SELECT
      u.user_first_name,
      u.user_last_name,
      u.user_email,
      m.alliance_member_id,
      t.*
    FROM alliance_schema.alliance_withdrawal_request_table t
    JOIN alliance_schema.alliance_member_table m
      ON t.alliance_withdrawal_request_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
      ON u.user_id = m.alliance_member_user_id
    WHERE m.alliance_member_alliance_id = $1
    ${searchCondition}
    ${sortCondition}
    LIMIT $3 OFFSET $4
  `, params);

    const totalCount = plv8.execute(`
        SELECT
            COUNT(*)
        FROM alliance_schema.alliance_withdrawal_request_table t
        JOIN alliance_schema.alliance_member_table m
        ON t.alliance_withdrawal_request_member_id = m.alliance_member_id
        JOIN user_schema.user_table u
        ON u.user_id = m.alliance_member_user_id
        WHERE m.alliance_member_alliance_id = $1
        ${searchCondition}
  `,[teamId])[0].count;

  returnData.data = topUpRequest;
  returnData.totalCount = Number(totalCount);
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_admin_withdrawal_history(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = {
    data:[],
    totalCount:0
};
plv8.subtransaction(function() {
  const {
    page = 1,
    limit = 13,
    search = '',
    teamMemberId,
    teamId,
    columnAccessor,
    isAscendingSort
  } = input_data;

  const member = plv8.execute(`
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
  `, [teamMemberId]);

  if (!member.length || member[0].alliance_member_role !== 'ADMIN') {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const offset = (page - 1) * limit;

  const params = [teamId, limit, offset];

  const searchCondition = search ? `AND t.alliance_withdrawal_request_id = '${search}'`: "";
  const sortBy = isAscendingSort ? "desc" : "asc";
  const sortCondition = columnAccessor
    ? `ORDER BY "${columnAccessor}" ${sortBy}`
    : "";

  const topUpRequest = plv8.execute(`
    SELECT
      u.user_first_name,
      u.user_last_name,
      u.user_email,
      m.alliance_member_id,
      t.*
    FROM alliance_schema.alliance_withdrawal_request_table t
    JOIN alliance_schema.alliance_member_table m
      ON t.alliance_withdrawal_request_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
      ON u.user_id = m.alliance_member_user_id
    WHERE m.alliance_member_alliance_id = $1
    ${searchCondition}
    ${sortCondition}
    LIMIT $2 OFFSET $3
  `, params);

    const totalCount = plv8.execute(`
        SELECT
            COUNT(*)
        FROM alliance_schema.alliance_withdrawal_request_table t
        JOIN alliance_schema.alliance_member_table m
        ON t.alliance_withdrawal_request_member_id = m.alliance_member_id
        JOIN user_schema.user_table u
        ON u.user_id = m.alliance_member_user_id
        WHERE m.alliance_member_alliance_id = $1
        ${searchCondition}
  `,[teamId])[0].count;

  returnData.data = topUpRequest;
  returnData.totalCount = Number(totalCount);
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
