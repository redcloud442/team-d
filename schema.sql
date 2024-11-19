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
    INSERT INTO user_schema.user_table (user_id, user_email, user_password, user_step)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id, user_email, user_step
  `;
   const result = plv8.execute(insertQuery, [userId,email, password, 'ONBOARDING']);

  const insertReferalQuery = `
    INSERT INTO user_schema.user_referal_link_table (user_referal_link_id, user_referal_link, user_referal_link_user_id)
    VALUES ($1, $2, $3)
    `;
  const linkForReferal = `${url}?referalLink=${referalId}`
  plv8.execute(insertReferalQuery, [referalId, linkForReferal, userId]);

  if(referalLink){
    const checkIfReferalIsTen = plv8.execute(`
        SELECT COUNT(*)
        FROM user_schema.user_referal_table ur
        JOIN user_schema.user_referal_link_table rl
        ON ur.user_referal_referal_link_id = rl.user_referal_link_id
        WHERE user_referal_link_id = $1
    `,[referalLink])[0].count;

    if(checkIfReferalIsTen < 10){
      plv8.execute(`
        INSERT INTO user_schema.user_referal_table (user_referal_user_id, user_referal_referal_link_id)
        VALUES ($1, $2)
      `,[userId,referalLink])
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
