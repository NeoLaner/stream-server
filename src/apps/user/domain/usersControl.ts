import User from "../data-access/userModel";
import { ExpressMiddlewareFn, UserDataRes } from "../../../utils/@types";
import AppError from "../../../utils/classes/appError";
import catchAsync from "../../../utils/factory/catchAsync";

export const getUser: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res, next) {
    //eslint-disable-next-line
    const { id: userId } = req.params;

    if (!userId)
      return next(new AppError("Please provide a valid user id", 400));
    const userData = await User.findOne({ userId });

    if (!userData)
      return next(new AppError("No user data found with this id", 404));

    const data = {
      _id: userData._id,
      photo: userData.photo,
      name: userData.name,
      aboutUser: userData.aboutUser,
      userId: userData.userId,
      links: userData.links,
    };

    const respond: UserDataRes = {
      status: "success",
      data: {
        user: data,
      },
    };

    res.status(200).send(respond);
  }
);

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

export const getCountUser: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res) {
    const countDocs = await User.collection.countDocuments();
    const respond = {
      status: "success",
      data: {
        user: { countDocs },
      },
    };

    res.status(200).send(respond);
  }
);
