import { UserDataApi } from ".";

declare module "express" {
  interface Request {
    user?: UserDataApi; // Add your custom property
    instance?: InstanceData;
  }
}
