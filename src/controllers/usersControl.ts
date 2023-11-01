import { ExpressMiddlewareFn } from "../utils/@types";

export const getUser: ExpressMiddlewareFn<void> = function (req, res) {
  const { user } = req;
  res.status(200).send({
    status: "success",
    data: {
      _id: user?._id,
      name: user?.name,
      userId: user?.userId,
      photo: user?.photo,
    },
  });
};
