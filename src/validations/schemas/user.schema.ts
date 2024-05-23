import Joi from "joi";

export default {
  register: {
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(30).required(),
      firstName: Joi.string().min(3).max(100).required(),
      lastName: Joi.string().min(3).max(100).required(),
    }),
  },
  login: {
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  },
  updateMe: {
    body: Joi.object().keys({
      firstName: Joi.string().min(3).max(100).required(),
      lastName: Joi.string().min(3).max(100).required(),
    }),
  },
};
