import database from '~/infra/database';
import password from '~/models/password';
import { NotFoundError, ValidationError } from '~/infra/errors';

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
};

async function findOneByUsername(username: string): Promise<User> {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username: string) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: 'O username informado não foi encontrado no sistema.',
        action: 'Verifique se o username está digitado corretamente.',
      });
    }

    return results.rows[0];
  }
}

async function findOneByEmail(email: string): Promise<User> {
  const userFound = await runSelectQuery(email);

  return userFound;

  async function runSelectQuery(email: string) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [email],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: 'O email informado não foi encontrado no sistema.',
        action: 'Verifique se o email está digitado corretamente.',
      });
    }

    return results.rows[0];
  }
}

export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
};

async function create(userInputValues: CreateUserInput): Promise<User> {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);

  return newUser;

  async function runInsertQuery(userInputValues: CreateUserInput) {
    const results = await database.query({
      text: `
        INSERT INTO
          users (username, email, password) 
        VALUES
          ($1, $2, $3)
        RETURNING
         *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return results.rows[0];
  }
}

async function update(
  username: string,
  userInputValues: Partial<CreateUserInput>,
) {
  const currentUser = await findOneByUsername(username);

  if (userInputValues.username) {
    await validateUniqueUsername(userInputValues.username);
  }

  if (userInputValues.email) {
    await validateUniqueEmail(userInputValues.email);
  }

  if (userInputValues.password) {
    await hashPasswordInObject(userInputValues as { password: string });
  }

  const userWithNewValues = {
    ...currentUser,
    ...userInputValues,
  };

  return await runUpdateQuery(userWithNewValues);

  async function runUpdateQuery(userWithNewValues: User) {
    const results = await database.query({
      text: `
        UPDATE 
          users
        SET
          username = $2,
          email = $3,
          password = $4,
          updated_at = timezone('utc', now())
        WHERE
          id=$1
        RETURNING
          *
      `,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    });

    return results.rows[0];
  }
}

async function validateUniqueUsername(username: string) {
  const results = await database.query({
    text: `
      SELECT
        username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      ;`,
    values: [username],
  });

  if (results.rowCount !== null && results.rowCount > 0) {
    throw new ValidationError({
      message: 'O username informado já está sendo utilizado.',
      action: 'Utilize outro username para esta operação.',
    });
  }
}

async function validateUniqueEmail(email: string) {
  const results = await database.query({
    text: `
      SELECT
        email
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      ;`,
    values: [email],
  });

  if (results.rowCount !== null && results.rowCount > 0) {
    throw new ValidationError({
      message: 'O email informado já está sendo utilizado.',
      action: 'Utilize outro email para esta operação.',
    });
  }
}

async function hashPasswordInObject(userInputValues: {
  [key: string]: unknown;
  password: string;
}) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

const user = { create, findOneByUsername, findOneByEmail, update };

export default user;
