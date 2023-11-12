import { ExpressMiddlewareFn, UserDataRes } from "../utils/@types";

export const getUserViaToken: ExpressMiddlewareFn<void> = function (req, res) {
  //eslint-disable-next-line
  const user = req.user!; //from protect middleware

  const data = {
    _id: user._id,
    photo: user.photo,
    name: user.name,
    userId: user.userId,
  };

  const respond: UserDataRes = {
    status: "success",
    data: {
      user: data,
    },
  };

  res.status(200).send(respond);
};
