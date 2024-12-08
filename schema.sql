

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
    throw new Error('Email and password are required');
  }

  const insertUserQuery = `
    INSERT INTO user_schema.user_table (user_id, user_email, user_password, user_iv, user_first_name, user_last_name, user_username)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING user_id, user_email
  `;
  const result = plv8.execute(insertUserQuery, [userId, email, password,iv,firstName,lastName, userName]);

  if (!result || result.length === 0) {
    throw new Error('Failed to create user');
  }

  const allianceMemberId = plv8.execute(`
    INSERT INTO alliance_schema.alliance_member_table (alliance_member_role, alliance_member_alliance_id, alliance_member_user_id)
    VALUES ($1, $2, $3)
    RETURNING alliance_member_id
  `, ['MEMBER', '35f77cd9-636a-41fa-a346-9cb711e7a338', userId])[0].alliance_member_id;

  plv8.execute(`
    INSERT INTO alliance_schema.alliance_earnings_table (alliance_earnings_member_id)
    VALUES ($1)
  `, [allianceMemberId]);


  const referralLinkURL = `${url}?referalLink=${userName}`;
  plv8.execute(`
    INSERT INTO alliance_schema.alliance_referral_link_table (alliance_referral_link, alliance_referral_link_member_id)
    VALUES ($1, $2)
  `, [ referralLinkURL, allianceMemberId]);

  if (referalLink) {

    const referrerData = plv8.execute(`
      SELECT alliance_referral_link_member_id
      FROM alliance_schema.alliance_referral_link_table
      JOIN alliance_schema.alliance_member_table
      ON alliance_member_id = alliance_refereral_link_member_id
      JOIN user_schema.user_table ON user_id = alliance_member_user_id
      WHERE user_username = $1
    `, [referalLink]);

    if (referrerData.length === 0) {
      throw new Error('Invalid referral link');
    }

    const referrerId = referrerData[0].alliance_referral_link_member_id;

    const referralHierarchy = plv8.execute(`
     WITH RECURSIVE referral_tree AS (
        SELECT
            alliance_referral_link_id,
            alliance_referral_from_member_id,
            alliance_referral_level
        FROM alliance_schema.alliance_referral_table
        WHERE alliance_referral_link_id = $1
        UNION ALL
        SELECT
            rt.alliance_referral_link_id,
            rt.alliance_referral_from_member_id,
            r.alliance_referral_level + 1 AS level
        FROM alliance_schema.alliance_referral_table rt
        JOIN referral_tree r ON rt.alliance_referral_from_member_id = r.alliance_referral_link_id
    )
    SELECT alliance_referral_level
    FROM referral_tree
    ORDER BY alliance_referral_level DESC
    LIMIT 1
    `, [referalLink]);

    const newReferralLevel = referralHierarchy.length > 0 ? referralHierarchy[0].level + 1 : 1;

    if (newReferralLevel <= 12) {
      plv8.execute(`
        INSERT INTO alliance_schema.alliance_referral_table (
          alliance_referral_member_id,
          alliance_referral_link_id,
          alliance_referral_from_member_id,
          alliance_referral_bonus_amount,
          alliance_referral_level
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        allianceMemberId,
        referalLink,
        referrerId,
        calculateBonus(newReferralLevel),
        newReferralLevel
      ]);
    }
  }

  returnData = {
    success: true,
    user: result[0],
  };
});
function calculateBonus(level) {
  const levelBonusMap = {
    1: 10,
    2: 3,
    3: 3,
    4: 3,
    5: 2.5,
    6: 2.5,
    7: 2.5,
    8: 2,
    9: 2,
    10: 2,
    11: 1,
    12: 1,
  };
  return levelBonusMap[level] || 0;
}
return returnData;

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
  const sortBy = isAscendingSort ? "desc" : "asc";
  const sortCondition = columnAccessor
    ? `ORDER BY "${columnAccessor}" ${sortBy}`
    : "";

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
    ${sortCondition}
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

  const searchCondition = search ? `AND t.u.user_email = '${search}'`: "";
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
    totalEarnings :0,
    totalWithdraw :0,
    chartData: []
};
plv8.subtransaction(function() {
  const {
    teamMemberId,
    dateFilter,
  } = input_data;

  if (!teamMemberId) {
    returnData = { success: false, message: 'teamMemberId is required' };
    return;
  }

  const currentDate = new Date(
    plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date
  ).toISOString();

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

  const totalEarnings = plv8.execute(`
    SELECT SUM(package_member_amount) AS total_earnings
    FROM packages_schema.package_member_connection_table
  `)[0]?.total_earnings || 0;

  const totalWithdraw = plv8.execute(`
    SELECT SUM(alliance_withdrawal_request_amount) AS total_withdraw
    FROM alliance_schema.alliance_withdrawal_request_table
  `)[0]?.total_withdraw || 0;

  const chartData = plv8.execute(`
    WITH
    daily_earnings AS (
        SELECT
        DATE_TRUNC('day', package_member_connection_created) AS date,
        SUM(package_member_amount) AS earnings
        FROM
        packages_schema.package_member_connection_table
        WHERE
        package_member_connection_created >= CURRENT_DATE - INTERVAL '90 days'
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
        alliance_withdrawal_request_date >= CURRENT_DATE - INTERVAL '90 days'
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
  `,[dateFilter]);

  returnData.chartData = chartData.map(row => ({
    date: row.date.toISOString().split('T')[0],
    earnings: row.earnings,
    withdraw: row.withdraw,
  }));

  returnData.totalEarnings = totalEarnings;
  returnData.totalWithdraw = totalWithdraw;
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

  const currentDate = new Date(
    plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date
  ).toISOString();

  const member = plv8.execute(
    `
    SELECT alliance_member_role
    FROM alliance_schema.alliance_member_table
    WHERE alliance_member_id = $1
    `,
    [teamMemberId]
  );

  if (!member.length || (member[0].alliance_member_role !== 'MEMBER' && member[0].alliance_member_role !== 'MERCHANT')) {
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
    const elapsedDays = Math.max((new Date(currentDate) - startDate) / (1000 * 60 * 60 * 24), 0);
    const totalDays = Math.max((completionDate - startDate) / (1000 * 60 * 60 * 24), 0);

    const percentage =
      elapsedDays >= totalDays
        ? 100
        : Math.round((elapsedDays / totalDays) * 100);

    return {
      package: row.package,
      completion_date: completionDate.toISOString().split('T')[0],
      amount: parseFloat(row.amount),
      completion:percentage
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
USING (
  EXISTS (
    SELECT 1
    FROM packages_schema.package_member_connection_table pmc
    JOIN alliance_schema.alliance_member_table amt
      ON pmc.package_member_member_id = amt.alliance_member_id
    WHERE pmc.package_member_package_id = package_id
      AND amt.alliance_member_user_id = (SELECT auth.uid())
  )
);

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
