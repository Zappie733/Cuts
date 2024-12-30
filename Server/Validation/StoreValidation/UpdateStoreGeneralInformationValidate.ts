import Joi from "joi";
import {
  ImageRequestObj,
  UpdateStoreGeneralInformationRequestObj,
} from "../../dto";

export const UpdateStoreGeneralInformationValidate = (
  data: UpdateStoreGeneralInformationRequestObj
) => {
  const schema = Joi.object<UpdateStoreGeneralInformationRequestObj>({
    name: Joi.string().required().label("Name"),
    images: Joi.array()
      .items(
        Joi.object<ImageRequestObj>({
          imageId: Joi.string().label("Image ID"),
          file: Joi.string()
            .pattern(
              /^(https?:\/\/[^\s]+|data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+={0,2}|[A-Za-z0-9+/]+={0,2})$/
            )
            .required()
            .label("File"),
          path: Joi.string().label("Path"),
          _id: Joi.string().label("_id"),
        })
      )
      .min(1)
      .required()
      .label("Images"),
    district: Joi.string().required().label("District"),
    subDistrict: Joi.string().required().label("Subdistrict"),
    location: Joi.string().required().label("Location"),
    openHour: Joi.number().min(0).max(23).required().label("Open Hour"),
    openMinute: Joi.number().min(0).max(59).required().label("Open Minute"),
    closeHour: Joi.number().min(0).max(23).required().label("Close Hour"),
    closeMinute: Joi.number().min(0).max(59).required().label("Close Minute"),
    canChooseWorker: Joi.boolean().required().label("Can Choose Worker"),
    toleranceTime: Joi.number().required().label("Tolerance Time"),
  });

  return schema.validate(data);
};
