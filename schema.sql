

DELETE FROM storage.buckets;

CREATE POLICY buckets_policy ON storage.buckets FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name) VALUES ('REQUEST_ATTACHMENTS', 'REQUEST_ATTACHMENTS');

UPDATE storage.buckets SET public = true;
CREATE EXTENSION IF NOT EXISTS pg_cron;


CREATE OR REPLACE FUNCTION get_current_date()
RETURNS TIMESTAMPTZ
SET search_path TO ''
AS $$
BEGIN
  RETURN NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_user_trigger(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$

let returnData;

plv8.subtransaction(function() {
  const {
    userName,
    email,
    password,
    userId,
    referalLink,
    firstName,
    lastName,
    url,
    iv
  } = input_data;

  if (!email || !password) {
    throw new Error('Both email and password are required to create a user.');
  }
  
  const DEFAULT_ALLIANCE_ID = '35f77cd9-636a-41fa-a346-9cb711e7a338';

  // Create user
  const insertUserQuery = `
    INSERT INTO user_schema.user_table (user_id, user_email, user_password, user_iv, user_first_name, user_last_name, user_username)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING user_id, user_email
  `;
  const result = plv8.execute(insertUserQuery, [userId, email, password, iv, firstName, lastName, userName]);

  if (!result || result.length === 0) {
    throw new Error('Failed to create user');
  }

  // Create alliance member
  const allianceMemberId = plv8.execute(`
    INSERT INTO alliance_schema.alliance_member_table (alliance_member_role, alliance_member_alliance_id, alliance_member_user_id)
    VALUES ($1, $2, $3)
    RETURNING alliance_member_id
  `, ['MEMBER', DEFAULT_ALLIANCE_ID, userId])[0].alliance_member_id;

  // Insert earnings entry
  plv8.execute(`
    INSERT INTO alliance_schema.alliance_earnings_table (alliance_earnings_member_id)
    VALUES ($1)
  `, [allianceMemberId]);

  // Create referral link
  const referralLinkURL = `${url}?referralLink=${encodeURIComponent(userName)}`;
  plv8.execute(`
    INSERT INTO alliance_schema.alliance_referral_link_table (alliance_referral_link, alliance_referral_link_member_id)
    VALUES ($1, $2)
  `, [referralLinkURL, allianceMemberId]);


  if (referalLink) {
    handleReferral(referalLink, allianceMemberId);
  }

  returnData = {
    success: true,
    user: result[0],
  };
});

function handleReferral(referalLink, allianceMemberId) {
  
  const referrerData = plv8.execute(`
    SELECT 
      rl.alliance_referral_link_id,
      rt.alliance_referral_hierarchy,
      am.alliance_member_id
    FROM alliance_schema.alliance_referral_link_table rl
    LEFT JOIN alliance_schema.alliance_referral_table rt
      ON rl.alliance_referral_link_member_id = rt.alliance_referral_member_id
    LEFT JOIN alliance_schema.alliance_member_table am
      ON am.alliance_member_id = rl.alliance_referral_link_member_id
    LEFT JOIN user_schema.user_table ut
      ON ut.user_id = am.alliance_member_user_id
    WHERE ut.user_username = $1
  `, [referalLink]);

  if (referrerData.length === 0) {
    throw new Error('Invalid referral link');
  }

  const referrerLinkId = referrerData[0].alliance_referral_link_id;
  const parentHierarchy = referrerData[0].alliance_referral_hierarchy;
  const referrerMemberId = referrerData[0].alliance_member_id;

  const newReferral = plv8.execute(`
    INSERT INTO alliance_schema.alliance_referral_table (
      alliance_referral_member_id,
      alliance_referral_link_id,
      alliance_referral_hierarchy,
      alliance_referral_from_member_id
    ) VALUES ($1, $2, $3, $4)
    RETURNING alliance_referral_id
  `, [
    allianceMemberId,
    referrerLinkId,
    "",
    referrerMemberId
  ]);

  const newReferralId = newReferral[0].alliance_referral_id;

  const newHierarchy = parentHierarchy ? `${parentHierarchy}.${allianceMemberId}` : `${referrerMemberId}.${allianceMemberId}`;
  plv8.execute(`
    UPDATE alliance_schema.alliance_referral_table
    SET alliance_referral_hierarchy = $1
    WHERE alliance_referral_id = $2
  `, [newHierarchy, newReferralId]);
}
return returnData;

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_admin_top_up_history(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = {
  data: [],
  totalCount: 0
};
plv8.subtransaction(function() {
  const {
    page = 1,
    limit = 13,
    search = '',
    teamMemberId,
    teamId,
    isAscendingSort,
    columnAccessor,
    merchantFilter,
    userFilter,
    statusFilter,
    dateFilter = null
  } = input_data;

  // Check if the member has the correct role
  const member = plv8.execute(
    `
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
    `,
    [teamMemberId]
  );

  if (!member.length || (member[0].alliance_member_role !== 'ADMIN' && member[0].alliance_member_role !== 'MERCHANT')) {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const offset = (page - 1) * limit;
  const sortBy = isAscendingSort ? "asc" : "desc";
  const sortCondition = columnAccessor
    ? `ORDER BY "${columnAccessor}" ${sortBy}`
    : "";
  const merchantCondition = merchantFilter ? `AND approver.user_id = '${merchantFilter}'` : "";
  const userCondition = userFilter ? `AND u.user_id = '${userFilter}'` : "";
  const statusCondition = statusFilter ? `AND t.alliance_top_up_request_status = '${statusFilter}'`: "";
  const dateFilterCondition = dateFilter.start && dateFilter.end ? `AND t.alliance_top_up_request_date BETWEEN '${dateFilter.start}' AND '${dateFilter.end}'` : "";
  let searchCondition = '';
  const params = [teamId, limit, offset];

  if (search) {
    searchCondition = 'AND u.user_username ILIKE $4';
    params.push(`%${search}%`);
  }

  const topUpRequest = plv8.execute(
    `
    SELECT
      u.user_first_name,
      u.user_last_name,
      u.user_email,
      u.user_username,
      m.alliance_member_id,
      t.*,
      approver.user_username AS approver_username
    FROM alliance_schema.alliance_top_up_request_table t
    JOIN alliance_schema.alliance_member_table m
      ON t.alliance_top_up_request_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
      ON u.user_id = m.alliance_member_user_id
    LEFT JOIN alliance_schema.alliance_member_table mt
      ON mt.alliance_member_id = t.alliance_top_up_request_approved_by
    LEFT JOIN user_schema.user_table approver
      ON approver.user_id = mt.alliance_member_user_id
    WHERE m.alliance_member_alliance_id = $1
    ${searchCondition}
    ${userCondition}
    ${statusCondition}
    ${dateFilterCondition}
    ${merchantCondition}
    ${sortCondition}
    LIMIT $2 OFFSET $3
    `,
    params
  );

  const totalCount = plv8.execute(
    `
    SELECT COUNT(*)
    FROM alliance_schema.alliance_top_up_request_table t
    JOIN alliance_schema.alliance_member_table m
      ON t.alliance_top_up_request_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
      ON u.user_id = m.alliance_member_user_id
    LEFT JOIN alliance_schema.alliance_member_table mt
      ON mt.alliance_member_id = t.alliance_top_up_request_approved_by
    LEFT JOIN user_schema.user_table approver
      ON approver.user_id = mt.alliance_member_user_id
    WHERE m.alliance_member_alliance_id = $1
    ${searchCondition}
    ${userCondition}
    ${statusCondition}
    ${dateFilterCondition}
    ${merchantCondition}
    `,
    [teamId]
  )[0].count;

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
    isAscendingSort,
    userFilter,
    statusFilter,
    dateFilter
  } = input_data;

  const member = plv8.execute(`
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
  `, [teamMemberId]);

  if (!member.length || member[0].alliance_member_role !== 'ADMIN' || member[0].alliance_member_role !== 'MERCHANT') {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const offset = (page - 1) * limit;

  const params = [teamId, limit, offset];
  const userCondition = userFilter ? `AND u.user_id = '${userFilter}'` : "";
  const statusCondition = statusFilter ? `AND t.alliance_withdrawal_request_status = '${statusFilter}'`: "";
  const dateFilterCondition = dateFilter.start && dateFilter.end ? `AND t.alliance_withdrawal_request_date BETWEEN '${dateFilter.start}' AND '${dateFilter.end}'` : "";
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
      t.*,
      approver.user_username AS approver_username
    FROM alliance_schema.alliance_withdrawal_request_table t
    JOIN alliance_schema.alliance_member_table m
      ON t.alliance_withdrawal_request_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
      ON u.user_id = m.alliance_member_user_id
    LEFT JOIN alliance_schema.alliance_member_table mt
      ON mt.alliance_member_id = t.alliance_withdrawal_request_approved_by
    LEFT JOIN user_schema.user_table approver
      ON approver.user_id = mt.alliance_member_user_id
    WHERE m.alliance_member_alliance_id = $1
    ${searchCondition}
    ${userCondition}
    ${statusCondition}
    ${dateFilterCondition}
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
        LEFT JOIN alliance_schema.alliance_member_table mt
        ON mt.alliance_member_id = t.alliance_withdrawal_request_approved_by
    LEFT JOIN user_schema.user_table approver
      ON approver.user_id = mt.alliance_member_user_id
        WHERE m.alliance_member_alliance_id = $1
        ${searchCondition}
        ${searchCondition}
        ${userCondition}
        ${statusCondition}
        ${dateFilterCondition}
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
    isAscendingSort,
    userFilter,
    statusFilter,
    dateFilter
  } = input_data;

  const member = plv8.execute(`
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
  `, [teamMemberId]);

  if (!member.length || member[0].alliance_member_role !== 'ADMIN' || member[0].alliance_member_role !== 'MERCHANT') {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const offset = (page - 1) * limit;

  const params = [teamId, limit, offset];
  const userCondition = userFilter ? `AND u.user_id = '${userFilter}'` : "";
  const statusCondition = statusFilter ? `AND t.alliance_withdrawal_request_status = '${statusFilter}'`: "";
  const dateFilterCondition = dateFilter.start && dateFilter.end ? `AND t.alliance_withdrawal_request_date BETWEEN '${dateFilter.start}' AND '${dateFilter.end}'` : "";
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
      t.*,
      approver.user_username AS approver_username
    FROM alliance_schema.alliance_withdrawal_request_table t
    JOIN alliance_schema.alliance_member_table m
      ON t.alliance_withdrawal_request_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
      ON u.user_id = m.alliance_member_user_id
    LEFT JOIN alliance_schema.alliance_member_table mt
      ON mt.alliance_member_id = t.alliance_withdrawal_request_approved_by
    LEFT JOIN user_schema.user_table approver
      ON approver.user_id = mt.alliance_member_user_id
    WHERE m.alliance_member_alliance_id = $1
    ${searchCondition}
    ${userCondition}
    ${statusCondition}
    ${dateFilterCondition}
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
        LEFT JOIN alliance_schema.alliance_member_table mt
        ON mt.alliance_member_id = t.alliance_withdrawal_request_approved_by
    LEFT JOIN user_schema.user_table approver
      ON approver.user_id = mt.alliance_member_user_id
        WHERE m.alliance_member_alliance_id = $1
        ${searchCondition}
        ${searchCondition}
        ${userCondition}
        ${statusCondition}
        ${dateFilterCondition}
  `,[teamId])[0].count;

  returnData.data = topUpRequest;
  returnData.totalCount = Number(totalCount);
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_total_earnings(
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
    teamMemberId,
  } = input_data;

  const member = plv8.execute(`
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
  `, [teamMemberId]);

  if (!member.length || member[0].alliance_member_role !== 'MEMBER' || member[0].   alliance_member_role !== 'MERCHANT') {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const earnings = plv8.execute(`
    SELECT *
    FROM alliance_earnings_table
    WHERE alliance_earnings_member_id = $1
  `,[teamMemberId]);

});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_admin_user_data(
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
    isAscendingSort,
    userRole,
    dateCreated
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

  const searchCondition = search ? `AND u.user_username = '${search}'`: "";
  const roleCondition = userRole ? `AND m.alliance_member_role = '${userRole}'`: "";
  const dateCreatedCondition = dateCreated ? `AND u.user_date_created = '${dateCreated}'`: "";
  const sortBy = isAscendingSort ? "desc" : "asc";
  const sortCondition = columnAccessor
    ? `ORDER BY "${columnAccessor}" ${sortBy}`
    : "";

  const userRequest = plv8.execute(`
    SELECT
      u.*,
      m.*
    FROM alliance_schema.alliance_member_table m
    JOIN user_schema.user_table u
      ON u.user_id = m.alliance_member_user_id
    WHERE m.alliance_member_alliance_id = $1
    ${searchCondition}
    ${roleCondition}
    ${dateCreatedCondition}
    ${sortCondition}
    LIMIT $2 OFFSET $3
  `, params);

    const totalCount = plv8.execute(`
      SELECT
        COUNT(*)
      FROM alliance_schema.alliance_member_table m
      JOIN user_schema.user_table u
      ON u.user_id = m.alliance_member_user_id
      WHERE m.alliance_member_alliance_id = $1
      ${searchCondition}
      ${roleCondition}
      ${dateCreatedCondition}
  `,[teamId])[0].count;

  returnData.data = userRequest;
  returnData.totalCount = Number(totalCount);
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_ally_bounty(
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

  const params = [teamMemberId, limit, offset];

  const searchCondition = search ? `AND u.user_email = '${search}'`: "";
  const sortBy = isAscendingSort ? "desc" : "asc";
  const sortCondition = columnAccessor
    ? `ORDER BY "${columnAccessor}" ${sortBy}`
    : "";

  const userRequest = plv8.execute(`
    SELECT
     u.user_id,
     u.user_first_name,
     u.user_last_name
    FROM alliance_schema.alliance_member_table m
    JOIN alliance_schema.alliance_referral_table r
    ON r.alliance_referral_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
    ON u.user_id = m.alliance_member_user_id
    WHERE r.alliance_referral_level = '1'
    AND r.alliance_referral_from_member_id = $1
    ${searchCondition}
    ${sortCondition}
    LIMIT $2 OFFSET $3
  `, params);

    const totalCount = plv8.execute(`
      SELECT
        COUNT(*)
    FROM alliance_schema.alliance_member_table m
    JOIN alliance_schema.alliance_referral_table r
    ON r.alliance_referral_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
    ON u.user_id = m.alliance_member_user_id
    WHERE r.alliance_referral_level = '1'
    AND r.alliance_referral_from_member_id = $1
      ${searchCondition}
  `,[teamId])[0].count;

  returnData.data = userRequest;
  returnData.totalCount = Number(totalCount);
});
return returnData;
$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION get_legion_bounty(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = {
    data: [],
    totalCount: 0,
    success: true,
    message: 'Data fetched successfully',
};
plv8.subtransaction(function() {
  const {
    page = 1,
    limit = 13,
    search = '',
    teamMemberId,
    columnAccessor = 'u.user_first_name',
    isAscendingSort = true,
  } = input_data;

  if (!teamMemberId) {
    returnData = { success: false, message: 'teamMemberId is required' };
    return;
  }


  const member = plv8.execute(
    `
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
  `,
    [teamMemberId]
  );

  if (!member.length || member[0].alliance_member_role !== 'MEMBER') {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const offset = (page - 1) * limit;

  const recursiveQuery = `
    WITH RECURSIVE referral_chain AS (
      SELECT
        r.alliance_referral_member_id,
        r.alliance_referral_from_member_id,
        r.alliance_referral_level
      FROM alliance_schema.alliance_referral_table r
      WHERE r.alliance_referral_from_member_id = $1

      UNION ALL

      SELECT
        r.alliance_referral_member_id,
        r.alliance_referral_from_member_id,
        r.alliance_referral_level
      FROM alliance_schema.alliance_referral_table r
      INNER JOIN referral_chain rc
      ON rc.alliance_referral_member_id = r.alliance_referral_from_member_id
    )
    SELECT
      u.user_id,
      u.user_email,
      u.user_first_name,
      u.user_last_name,
      r.alliance_referral_level
    FROM referral_chain r
    JOIN alliance_schema.alliance_member_table m
    ON r.alliance_referral_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
    ON u.user_id = m.alliance_member_user_id
    WHERE ($2 = '' OR u.user_first_name ILIKE $2) AND alliance_referral_level > 1
    ORDER BY ${columnAccessor} ${isAscendingSort ? 'ASC' : 'DESC'}
    LIMIT $3 OFFSET $4
  `;

  const userRequest = plv8.execute(recursiveQuery, [
    teamMemberId,
    `%${search}%`,
    limit,
    offset,
  ]);

  const totalCountQuery = `
    WITH RECURSIVE referral_chain AS (
      SELECT
        r.alliance_referral_member_id,
        r.alliance_referral_from_member_id,
        r.alliance_referral_level
      FROM alliance_schema.alliance_referral_table r
      WHERE r.alliance_referral_from_member_id = $1

      UNION ALL

      SELECT
        r.alliance_referral_member_id,
        r.alliance_referral_from_member_id,
        r.alliance_referral_level
      FROM alliance_schema.alliance_referral_table r
      INNER JOIN referral_chain rc
      ON rc.alliance_referral_member_id = r.alliance_referral_from_member_id
    )
    SELECT COUNT(*)
    FROM referral_chain r
    JOIN alliance_schema.alliance_member_table m
    ON r.alliance_referral_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
    ON u.user_id = m.alliance_member_user_id
      WHERE ($2 = '' OR u.user_first_name ILIKE $2) AND alliance_referral_level > 1
  `;

  const totalCount = plv8.execute(totalCountQuery, [teamMemberId, `%${search}%`])[0].count;

  returnData.data = userRequest;
  returnData.totalCount = Number(totalCount);
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_legion_bounty(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = {
    data: [],
    totalCount: 0,
    success: true,
    message: 'Data fetched successfully',
};
plv8.subtransaction(function() {
  const {
    page = 1,
    limit = 13,
    search = '',
    teamMemberId,
    columnAccessor = 'u.user_first_name',
    isAscendingSort = true,
  } = input_data;

  if (!teamMemberId) {
    returnData = { success: false, message: 'teamMemberId is required' };
    return;
  }


  const member = plv8.execute(
    `
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
  `,
    [teamMemberId]
  );

  if (!member.length || member[0].alliance_member_role !== 'MEMBER') {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const offset = (page - 1) * limit;

  // Recursive CTE to fetch all referral chains
  const recursiveQuery = `
    WITH RECURSIVE referral_chain AS (
      SELECT
        r.alliance_referral_member_id,
        r.alliance_referral_from_member_id,
        r.alliance_referral_level
      FROM alliance_schema.alliance_referral_table r
      WHERE r.alliance_referral_from_member_id = $1

      UNION ALL

      SELECT
        r.alliance_referral_member_id,
        r.alliance_referral_from_member_id,
        r.alliance_referral_level
      FROM alliance_schema.alliance_referral_table r
      INNER JOIN referral_chain rc
      ON rc.alliance_referral_member_id = r.alliance_referral_from_member_id
    )
    SELECT
      u.user_id,
      u.user_email,
      u.user_first_name,
      u.user_last_name,
      r.alliance_referral_level
    FROM referral_chain r
    JOIN alliance_schema.alliance_member_table m
    ON r.alliance_referral_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
    ON u.user_id = m.alliance_member_user_id
    WHERE ($2 = '' OR u.user_first_name ILIKE $2) AND alliance_referral_level > 1
    ORDER BY ${columnAccessor} ${isAscendingSort ? 'ASC' : 'DESC'}
    LIMIT $3 OFFSET $4
  `;

  const userRequest = plv8.execute(recursiveQuery, [
    teamMemberId,
    `%${search}%`,
    limit,
    offset,
  ]);

  // Total count for pagination
  const totalCountQuery = `
    WITH RECURSIVE referral_chain AS (
      SELECT
        r.alliance_referral_member_id,
        r.alliance_referral_from_member_id,
        r.alliance_referral_level
      FROM alliance_schema.alliance_referral_table r
      WHERE r.alliance_referral_from_member_id = $1

      UNION ALL

      SELECT
        r.alliance_referral_member_id,
        r.alliance_referral_from_member_id,
        r.alliance_referral_level
      FROM alliance_schema.alliance_referral_table r
      INNER JOIN referral_chain rc
      ON rc.alliance_referral_member_id = r.alliance_referral_from_member_id
    )
    SELECT COUNT(*)
    FROM referral_chain r
    JOIN alliance_schema.alliance_member_table m
    ON r.alliance_referral_member_id = m.alliance_member_id
    JOIN user_schema.user_table u
    ON u.user_id = m.alliance_member_user_id
    WHERE ($2 = '' OR u.user_first_name ILIKE $2)
  `;

  const totalCount = plv8.execute(totalCountQuery, [teamMemberId, `%${search}%`])[0].count;

  returnData.data = userRequest;
  returnData.totalCount = Number(totalCount);
});
return returnData;
$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION get_admin_dashboard_data(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = {
    totalEarnings: 0,
    totalWithdraw: 0,
    totalLoot: 0,
    chartData: []
};

plv8.subtransaction(function() {
  const {
    teamMemberId,
    dateFilter = {}
  } = input_data;

  if (!teamMemberId) {
    returnData = { success: false, message: 'teamMemberId is required' };
    return;
  }

  const currentDate = new Date(
    plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date
  ).toISOString().split('T')[0];


  const startDate = dateFilter.start || currentDate;
  const endDate = dateFilter.end || currentDate;

  const member = plv8.execute(
    `
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
    `,
    [teamMemberId]
  );

  if (!member.length || member[0].alliance_member_role !== 'ADMIN') {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const totalEarnings = plv8.execute(
    `
    SELECT SUM(package_member_amount) AS total_earnings
    FROM packages_schema.package_member_connection_table
    WHERE package_member_connection_created BETWEEN $1 AND $2
    `,
    [startDate, endDate]
  )[0]?.total_earnings || 0;

  const totalWithdraw = plv8.execute(
    `
    SELECT SUM(alliance_withdrawal_request_amount) AS total_withdraw
    FROM alliance_schema.alliance_withdrawal_request_table
    WHERE alliance_withdrawal_request_date BETWEEN $1 AND $2
    `,
    [startDate, endDate]
  )[0]?.total_withdraw || 0;

  const totalLoot = plv8.execute(
    `
    SELECT SUM(package_ally_bounty_earnings) AS total_loot
    FROM packages_schema.package_ally_bounty_log
    WHERE package_ally_bounty_date BETWEEN $1 AND $2
    `,
    [startDate, endDate]
  )[0]?.total_loot || 0;



  const chartData = plv8.execute(
    `
    WITH
      daily_earnings AS (
        SELECT
          DATE_TRUNC('day', package_member_connection_created) AS date,
          SUM(package_member_amount) AS earnings
        FROM
          packages_schema.package_member_connection_table
        WHERE
          package_member_connection_created BETWEEN $1 AND $2
        GROUP BY
          DATE_TRUNC('day', package_member_connection_created)
      ),
      daily_withdraw AS (
        SELECT
          DATE_TRUNC('day', alliance_withdrawal_request_date) AS date,
          SUM(alliance_withdrawal_request_amount) AS withdraw
        FROM
          alliance_schema.alliance_withdrawal_request_table
        WHERE
          alliance_withdrawal_request_date BETWEEN $1 AND $2
        GROUP BY
          DATE_TRUNC('day', alliance_withdrawal_request_date)
      )
    SELECT
      COALESCE(e.date, w.date) AS date,
      COALESCE(e.earnings, 0) AS earnings,
      COALESCE(w.withdraw, 0) AS withdraw
    FROM
      daily_earnings e
    FULL OUTER JOIN
      daily_withdraw w
    ON
      e.date = w.date
    ORDER BY
      date;
    `,
    [startDate, endDate]
  );

  returnData.chartData = chartData.map(row => ({
    date: row.date.toISOString().split('T')[0],
    earnings: row.earnings,
    withdraw: row.withdraw,
  }));

  returnData.totalEarnings = totalEarnings;
  returnData.totalWithdraw = totalWithdraw;
  returnData.totalLoot = [];
});

return returnData;
$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION get_dashboard_data(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = [];

plv8.subtransaction(function() {
  const {
    teamMemberId,
    dateFilter,
  } = input_data;

  if (!teamMemberId) {
    returnData = { success: false, message: 'teamMemberId is required' };
    return;
  }

  const currentTimestamp = new Date(
    plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date
  )
  plv8.elog(NOTICE, `Current Timestamp: ${currentTimestamp}`);

  const member = plv8.execute(
    `
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
    `,
    [teamMemberId]
  );

  if (
    !member.length ||
    (member[0].alliance_member_role !== 'MEMBER' &&
     member[0].alliance_member_role !== 'MERCHANT')
  ) {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const chartData = plv8.execute(`
    SELECT
      p.package_name AS package,
      p.packages_days,
      pmc.package_member_status AS status,
      pmc.package_member_connection_created AS start_date,
      (pmc.package_member_connection_created + make_interval(days => p.packages_days)) AS completion_date,
      (pmc.package_member_amount + pmc.package_amount_earnings) AS amount
    FROM packages_schema.package_member_connection_table pmc
    JOIN packages_schema.package_table p
      ON pmc.package_member_package_id = p.package_id
    WHERE pmc.package_member_status = $1 AND pmc.package_member_member_id = $2
  `, ['ACTIVE', teamMemberId]);

  returnData = chartData.map(row => {
    const startDate = new Date(row.start_date);
    const completionDate = new Date(row.completion_date);

    plv8.elog(NOTICE, `Start Date: ${startDate}`);
    plv8.elog(NOTICE, `Completion Date: ${completionDate}`);

    if (isNaN(startDate) || isNaN(completionDate)) {
      plv8.elog(NOTICE, `Invalid dates detected.`);
      return {
        package: row.package,
        completion_date: null,
        amount: parseFloat(row.amount),
        completion: 0
      };
    }

    const elapsedTimeMs = Math.max(currentTimestamp - startDate, 0);

 
    const totalTimeMs = Math.max(completionDate - startDate, 0);

    const percentage = totalTimeMs > 0
      ? parseFloat(((elapsedTimeMs / totalTimeMs) * 100).toFixed(2))
      : 100.0;

    return {
      package: row.package,
      completion_date: completionDate.toISOString(),
      amount: parseFloat(row.amount),
      completion: percentage
    };
  });
});

return returnData;
$$ LANGUAGE plv8;



CREATE OR REPLACE FUNCTION get_history_log(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = {
    data: [],
    totalCount: 0,
    success: true,
    message: "Data fetched successfully",
};
plv8.subtransaction(function () {
  const {
    page = 1,
    limit = 13,
    teamMemberId,
    columnAccessor = "u.user_first_name",
    isAscendingSort = true,
  } = input_data;

  if (!teamMemberId) {
    returnData = { success: false, message: "teamMemberId is required" };
    return;
  }

  const member = plv8.execute(
    `
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
  `,
    [teamMemberId]
  );

  if (!member.length || member[0].alliance_member_role !== "ADMIN") {
    returnData = { success: false, message: "Unauthorized access" };
    return;
  }

  const offset = (page - 1) * limit;
  const sortBy = isAscendingSort ? "ASC" : "DESC";

  const historyLog = plv8.execute(
    `
    SELECT
      h.*,
      u.user_first_name,
      u.user_last_name,
      u.user_email
    FROM user_schema.user_table u
    JOIN user_schema.user_history_log h
    ON u.user_id = h.user_history_user_id
    ORDER BY
      ${columnAccessor} ${sortBy}
    LIMIT $1 OFFSET $2
  `,
    [limit, offset]
  );

  const historyLogCount = plv8.execute(
    `
    SELECT COUNT(*)
    FROM user_schema.user_table u
    JOIN user_schema.user_history_log h
    ON u.user_id = h.user_history_user_id
  `
  )[0].count;

  returnData.data = historyLog;
  returnData.totalCount = Number(historyLogCount);
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_packages_admin(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    teamMemberId,
  } = input_data;

  if (!teamMemberId) {
    returnData = { success: false, message: 'teamMemberId is required' };
    return;
  }

  const member = plv8.execute(
    `
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
  `,
    [teamMemberId]
  );
  if (!member.length || member[0].alliance_member_role !== 'ADMIN') {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const packagesData = plv8.execute(`
     SELECT * FROM packages_schema.package_table
  `);

  returnData = packagesData;
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_user_options(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = [];

plv8.subtransaction(function() {
  const {
    page = 1,
    limit = 10,
    teamMemberId
  } = input_data;

  const member = plv8.execute(
    `
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
    `,
    [teamMemberId]
  );

  if (!member.length || (member[0].alliance_member_role !== 'ADMIN' && member[0].alliance_member_role !== 'MERCHANT')) {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const offset = (page - 1) * limit;

  const userData = plv8.execute(
    `
    SELECT 
      user_id,
      user_username
    FROM user_schema.user_table
    JOIN alliance_schema.alliance_member_table
    ON alliance_member_user_id = user_id
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  returnData = userData;
});

return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_user_options_merchant(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = [];

plv8.subtransaction(function() {
  const {
    page = 1,
    limit = 10,
    teamMemberId
  } = input_data;

  const member = plv8.execute(
    `
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
    `,
    [teamMemberId]
  );

  if (!member.length || (member[0].alliance_member_role !== 'ADMIN' && member[0].alliance_member_role !== 'MERCHANT')) {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const offset = (page - 1) * limit;

  const userData = plv8.execute(
    `
    SELECT 
      user_id,
      user_username
    FROM user_schema.user_table
    JOIN alliance_schema.alliance_member_table
    ON alliance_member_user_id = user_id
    WHERE alliance_member_role = 'MERCHANT'
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  returnData = userData;
});

return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_dashboard_earnings(
  input_data JSON
)
RETURNS JSON
AS $$
let returnData = {};

plv8.subtransaction(function() {
  const {
    page = 1,
    limit = 10,
    teamMemberId
  } = input_data;

  const member = plv8.execute(
    `
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
    `,
    [teamMemberId]
  );

  if (!member.length) {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }


  const earningsAndWithdrawals = plv8.execute(
    `
    SELECT
      COALESCE(SUM(CASE WHEN pe.package_member_status = 'ENDED' THEN pe.package_member_amount ELSE 0 END), 0) AS total_earnings,
      COALESCE(SUM(CASE WHEN aw.alliance_withdrawal_request_status = 'APPROVED' THEN aw.alliance_withdrawal_request_amount ELSE 0 END), 0) AS total_withdrawal
    FROM packages_schema.package_earnings_log pe
    LEFT JOIN alliance_schema.alliance_withdrawal_request_table aw
      ON pe.package_member_member_id = aw.alliance_withdrawal_request_member_id
    WHERE pe.package_member_member_id = $1
    `,
    [teamMemberId]
  );
  
  const directReferralAmount = plv8.execute(
    `
    SELECT COALESCE(SUM(package_ally_bounty_earnings), 0) AS total_bounty
    FROM packages_schema.package_ally_bounty_log
    WHERE package_ally_bounty_member_id = $1 AND package_ally_bounty_type = 'DIRECT'
    `,
    [teamMemberId]
  );


    const indirectReferralAmount = plv8.execute(
    `
    SELECT COALESCE(SUM(package_ally_bounty_earnings), 0) AS total_bounty 
    FROM packages_schema.package_ally_bounty_log
    WHERE package_ally_bounty_member_id = 'c960b597-4032-4609-bc2c-97687a5e59ac AND package_ally_bounty_type = 'INDIRECT'
    `,
    [teamMemberId]
  );

  returnData = {
    totalEarnings: earningsAndWithdrawals[0]?.total_earnings || 0,
    withdrawalAmount: earningsAndWithdrawals[0]?.total_withdrawal || 0,
    directReferralAmount: directReferralAmount[0]?.total_bounty || 0,
    indirectReferralAmount: indirectReferralAmount[0]?.total_bounty || 0
  };
});

return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_package_modal_data(
  input_data JSON
)
RETURNS JSON
AS $$

let returnData = []
plv8.subtransaction(function() {
  const {
    teamMemberId
  } = input_data;

  const member = plv8.execute(`
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
  `, [teamMemberId]);

  if (!member.length || member[0].alliance_member_role !== 'MEMBER' && member[0].alliance_member_role !== 'MERCHANT') {
    returnData = { success: false, message: 'Unauthorized access' };
    return;
  }

  const packageData = plv8.execute(`
    SELECT *
    FROM packages_schema.package_table
  `);

  returnData = packageData
});
return returnData;

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_earnings_based_on_packages()
RETURNS void AS $$
  var results = plv8.execute(`
   SELECT
  pmct.package_member_connection_id,
  pmct.package_member_package_id,
  pmct.package_member_member_id,
  pmct.package_member_amount,
  pmct.package_amount_earnings,
  pmct.package_member_connection_created,
  p.package_percentage,
  p.packages_days
    FROM packages_schema.package_member_connection_table pmct
    JOIN packages_schema.package_table p
    ON pmct.package_member_package_id = p.package_id
    WHERE now() >= pmct.package_member_connection_created + (p.packages_days || ' days')::interval
    AND pmct.package_member_status = 'ACTIVE';
    `);

  results.forEach(row => {
    var earnings = row.package_member_amount + row.package_amount_earnings;
    plv8.execute(`
      UPDATE alliance_schema.alliance_earnings_table
      SET alliance_olympus_earnings = alliance_olympus_earnings + $1
      WHERE alliance_earnings_member_id = $2
    `, [earnings, row.package_member_member_id]);

    plv8.execute(`
      UPDATE packages_schema.package_member_connection_table
      SET package_member_status = 'ENDED'
      WHERE package_member_connection_id = $1
    `, [row.package_member_connection_id]);

    plv8.execute(`
      INSERT INTO packages_schema.package_earnings_log (
        package_earnings_log_id,
        package_member_connection_id,
        package_member_package_id,
        package_member_member_id,
        package_member_connection_created,
        package_member_amount,
        package_member_amount_earnings,
        package_member_status
      ) VALUES (
        uuid_generate_v4(), -- Generate a new UUID
        $1, $2, $3, $4, $5,$6, 'ENDED'
      )
    `, [
      row.package_member_connection_id,
      row.package_member_package_id,
      row.package_member_member_id,
      row.package_member_connection_created,
      row.package_member_amount,
      row.package_amount_earnings
    ]);
  });
$$ LANGUAGE plv8;

SELECT cron.schedule(
    'update_packages_job',
    '0 0,12 * * *',
    $$SELECT public.update_earnings_based_on_packages()$$ -- Command to execute
);

---rls---
ALTER TABLE user_schema.user_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON user_schema.user_table;
CREATE POLICY "Allow CREATE for authenticated users" ON user_schema.user_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON user_schema.user_table;
CREATE POLICY "Allow READ for anon users" ON user_schema.user_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON user_schema.user_table;
CREATE POLICY "Allow UPDATE for authenticated users"
ON user_schema.user_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

ALTER TABLE alliance_schema.alliance_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON alliance_schema.alliance_table;
CREATE POLICY "Allow READ for anon users" ON alliance_schema.alliance_table
AS PERMISSIVE FOR SELECT
USING (true);

ALTER TABLE alliance_schema.alliance_member_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON alliance_schema.alliance_member_table;
CREATE POLICY "Allow READ for anon users" ON alliance_schema.alliance_member_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow Insert for anon users" ON alliance_schema.alliance_member_table;
CREATE POLICY "Allow Insert for anon users" ON alliance_schema.alliance_member_table
AS PERMISSIVE FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with ADMIN role" ON alliance_schema.alliance_member_table;
CREATE POLICY "Allow UPDATE for authenticated users with ADMIN role" ON alliance_schema.alliance_member_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  alliance_member_id IN (
    SELECT alliance_member_team_id FROM alliance_schema.alliance_table
    WHERE alliance_member_user_id = (SELECT auth.uid())
    AND alliance_member_role IN ('ADMIN')
  ) OR alliance_member_user_id = (SELECT auth.uid())
);

-- Enable Row Level Security
ALTER TABLE packages_schema.package_table ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for authenticated users
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON packages_schema.package_table;
CREATE POLICY "Allow SELECT for authenticated users" ON packages_schema.package_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- Allow UPDATE for ADMIN users
DROP POLICY IF EXISTS "Allow UPDATE for ADMIN users" ON packages_schema.package_table;
CREATE POLICY "Allow UPDATE for ADMIN users" ON packages_schema.package_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM alliance_schema.alliance_member_table amt
    WHERE amt.alliance_member_user_id = (SELECT auth.uid())
      AND amt.alliance_member_role = 'ADMIN'
  )
);

-- Allow INSERT for ADMIN users
DROP POLICY IF EXISTS "Allow INSERT for ADMIN users" ON packages_schema.package_table;
CREATE POLICY "Allow INSERT for ADMIN users" ON packages_schema.package_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM alliance_schema.alliance_member_table amt
    WHERE amt.alliance_member_user_id = (SELECT auth.uid())
      AND amt.alliance_member_role = 'ADMIN'
  )
);


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
