import Ajv from 'ajv';
import profileSchema from '../../schema/users/profile.json';
import ValidationError from '../errors/validation-error';
import generateValidationErrorMessage from '../errors/messages';

function validate(req) {
  const ajvValidate = new Ajv().compile(profileSchema);
  const valid = ajvValidate(req.body);
  if (!valid) {
    return new ValidationError(generateValidationErrorMessage(ajvValidate.errors, '.profile'));
  }
  return true;
}

export default validate;
