import axios from "axios";

const Get = (url: string): MethodDecorator => {
  return (
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const fn = descriptor.value;
    axios
      .get(url)
      .then((res: any) => {
        fn(res, {
          statusCode: 200,
          success: true,
        });
      })
      .catch((err: Error) => {
        fn(err, {
          statusCode: 500,
          success: false,
        });
      });
  };
};

class Controller {
  constructor() {}

  @Get("https://api.apiopen.top/api/")
  getList(res: any, status: { statusCode: number; success: boolean }) {
    console.log(res.data.message);
    console.log(status);
  }
}
