const knex = require("knex");
const db = knex(require("./knexfile"));

const find = async () => {
  return await db("users");
};

const findById = async (id) => {
  return await db("users").where({ id }).first();
};

const findByLogin = async (login) => {
  return await db("users")
    .where({ username: login })
    .orWhere({ email: login })
    .first();
};

const add = async (user) => {
  return await db("users").insert(user);
};

const remove = async (id) => {
  return await db("users").where({ id }).del();
};

const update = async (id, data) => {
  return await db("users").where({ id }).first().update(data);
};

module.exports = {
  find,
  findById,
  add,
  remove,
  update,
  findByLogin,
};
