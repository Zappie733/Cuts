import Joi from "joi";
import { AbsenceWorkerRequestObj } from "../../../dto/Workers";

export const AbsenceWorkerValidate = (data: AbsenceWorkerRequestObj) => {
  const schema = Joi.object<AbsenceWorkerRequestObj>({
    id: Joi.string().required().label("Worker ID"),
    reason: Joi.string().required().label("Reason"),
  });

  return schema.validate(data);
};
