import cron from "node-cron";
import { ORDERS } from "../Models/OrderModel";
import { sendEmail } from "./UserUtil";
import { USERS } from "../Models/UserModel";
import { STORES } from "../Models/StoreModel";
import {
  ServiceHistoryObj,
  ServiceProductHistoryObj,
} from "../dto/OrderHistory";
import { ORDERHISTORY } from "../Models/OrderHistoryModel";

// Schedule a cron job
export const InitializeCronJobs = () => {
  //auto reject Waiting for Confirmation order that has been in the same state for 5 minutes
  cron.schedule("* * * * *", async () => {
    // console.log(
    //   "This task runs every minutes to do auto reject for `Waiting for Confirmation` order that has been in the same state for 5 minutes and notify the users"
    // );

    try {
      const currentTimeW5MBehind = new Date(Date.now() - 5 * 60 * 1000);

      const orders = await ORDERS.find({
        status: "Waiting for Confirmation",
        createdAt: {
          $lte: currentTimeW5MBehind,
        },
      });
      // .select(
      //   "userId createdAt status storeId isManual serviceIds chosenServiceProductsIds"
      // )

      if (orders.length === 0) {
        console.log("No 'Waiting for Confirmation' orders to process.");
        return;
      }

      const orderIds = orders.map((order) => order._id);
      console.log("autoRejectedIds (Waiting for Confirmation): " + orderIds);

      await ORDERS.updateMany(
        { _id: { $in: orderIds } },
        {
          status: "Rejected",
          rejectedReason:
            "Auto Rejected (store does not response for more than 5 minutes)",
        }
      );

      for (const order of orders) {
        const user = await USERS.findOne({ _id: order.userId }).select(
          "email firstName lastName phone"
        );

        const store = await STORES.findOne({ _id: order.storeId }).select(
          "name services serviceProducts workers"
        );
        console.log(user);
        console.log(store);

        if (user && store) {
          //notify user
          await sendEmail(
            "cronReject",
            user.email,
            `${user.firstName} your order has been auto rejected by ${store.name}`,
            `This message is auto generated, your order(${order._id}) has been rejected due to the store did not response to your order for more than 5 minutes`,
            `${user.firstName}`
          );

          //just for automatic order, increase the service products back
          if (order.isManual === false) {
            const servicesForHistory: ServiceHistoryObj[] = [];

            for (const serviceId of order.serviceIds) {
              // const reducedServices = store.services.map(
              //   ({ _id, serviceProduct }) => ({
              //     _id,
              //     serviceProduct,
              //   })
              // );

              // const service = reducedServices.find(
              //   (service) => service._id?.toString() === serviceId.toString()
              // );

              const service = store.services.find(
                (service) => service._id?.toString() === serviceId.toString()
              );

              if (!service) {
                continue;
              }

              servicesForHistory.push({
                id: service._id,
                name: service.name,
                price: service.price,
                duration: service.duration,
                discount: service.discount,
                serviceProducts: [],
              });

              if (service.serviceProduct) {
                const allServiceProductIds = service.serviceProduct;
                console.log(
                  "All Service Products Ids: " + allServiceProductIds
                );

                for (const serviceProductId of allServiceProductIds) {
                  const serviceProduct = store.serviceProducts.find(
                    (serviceProduct) =>
                      serviceProduct._id?.toString() ===
                      serviceProductId.toString()
                  );

                  if (
                    serviceProduct &&
                    (serviceProduct.isAnOption === false ||
                      order.chosenServiceProductsIds
                        ?.find(
                          (obj) =>
                            obj.serviceId.toString() === serviceId.toString()
                        )
                        ?.serviceProductIds.includes(
                          serviceProduct._id?.toString() ?? ""
                        ))
                  ) {
                    console.log(
                      `increase service product ${serviceProduct._id}`
                    );
                    serviceProduct.quantity += 1;

                    const serviceProductsForHistory: ServiceProductHistoryObj =
                      {
                        id: serviceProduct._id,
                        name: serviceProduct.name,
                        addtionalPrice: serviceProduct.addtionalPrice,
                      };

                    servicesForHistory[
                      servicesForHistory.findIndex(
                        (obj) => obj.id?.toString() === serviceId.toString()
                      )
                    ].serviceProducts?.push(serviceProductsForHistory);
                  }
                }
              }
            }

            await store.save();

            const worker = store.workers.find(
              (worker) => worker._id?.toString() === order.workerId?.toString()
            );
            //console.log(worker);
            const newOrderHistory = new ORDERHISTORY({
              orderId: order._id,
              userId: order.userId,
              userName: user?.firstName + " " + user?.lastName,
              userPhone: user?.phone,
              storeId: store._id,
              services: servicesForHistory,
              isManual: order.isManual,
              status: "Rejected",
              totalPrice: order.totalPrice,
              totalDuration: order.totalDuration,
              date: order.date,
              endTime: order.endTime,
              hasRating: order.hasRating,
              workerId: order.workerId,
              workerName: worker?.firstName + " " + worker?.lastName,
              rejectedReason:
                "Auto Rejected (store does not response for more than 5 minutes)",
            });
            //console.log("newOrderHistory: ", newOrderHistory);
            await newOrderHistory.save();
          }
        }
      }
    } catch (error) {
      console.error(
        "Error during cron job execution (auto reject for `Waiting for Confirmation`):",
        error
      );
    }
  });

  //auto reject Waiting for Payment order that has been in the same state for 5 minutes
  cron.schedule("* * * * *", async () => {
    // console.log(
    //   "This task runs every minutes to do auto reject for `Waiting for Payment` order that has been in the same state for 5 minutes and notify the users"
    // );

    try {
      const currentTimeW5MBehind = new Date(Date.now() - 5 * 60 * 1000);

      const orders = await ORDERS.find({
        status: "Waiting for Payment",
        updatedAt: {
          $lte: currentTimeW5MBehind,
        },
      });
      // .select(
      //   "userId updatedAt status storeId isManual serviceIds chosenServiceProductsIds"
      // )

      if (orders.length === 0) {
        console.log("No 'Waiting for Payment' orders to process.");
        return;
      }

      const orderIds = orders.map((order) => order._id);
      console.log("autoRejectedIds (Waiting for Payment): " + orderIds);

      await ORDERS.updateMany(
        { _id: { $in: orderIds } },
        {
          status: "Rejected",
          rejectedReason:
            "Auto Rejected (user does not pay the order for more than 5 minutes)",
        }
      );

      for (const order of orders) {
        const user = await USERS.findOne({ _id: order.userId }).select(
          "email firstName lastName phone"
        );

        const store = await STORES.findOne({ _id: order.storeId }).select(
          "name services serviceProducts workers"
        );
        console.log(user);
        console.log(store);

        if (user && store) {
          //notify user
          await sendEmail(
            "cronReject",
            user.email,
            `${user.firstName} your order has been auto rejected by System`,
            `This message is auto generated, your order(${order._id}) has been rejected due to you did not pay the order for more than 5 minutes`,
            `${user.firstName}`
          );

          //just for automatic order, increase the service products back
          if (order.isManual === false) {
            const servicesForHistory: ServiceHistoryObj[] = [];

            for (const serviceId of order.serviceIds) {
              // const reducedServices = store.services.map(
              //   ({ _id, serviceProduct }) => ({
              //     _id,
              //     serviceProduct,
              //   })
              // );

              // const service = reducedServices.find(
              //   (service) => service._id?.toString() === serviceId.toString()
              // );

              const service = store.services.find(
                (service) => service._id?.toString() === serviceId.toString()
              );

              if (!service) {
                continue;
              }

              servicesForHistory.push({
                id: service._id,
                name: service.name,
                price: service.price,
                duration: service.duration,
                discount: service.discount,
                serviceProducts: [],
              });

              if (service.serviceProduct) {
                const allServiceProductIds = service.serviceProduct;
                console.log(
                  "All Service Products Ids: " + allServiceProductIds
                );

                for (const serviceProductId of allServiceProductIds) {
                  const serviceProduct = store.serviceProducts.find(
                    (serviceProduct) =>
                      serviceProduct._id?.toString() ===
                      serviceProductId.toString()
                  );

                  if (
                    serviceProduct &&
                    (serviceProduct.isAnOption === false ||
                      order.chosenServiceProductsIds
                        ?.find(
                          (obj) =>
                            obj.serviceId.toString() === serviceId.toString()
                        )
                        ?.serviceProductIds.includes(
                          serviceProduct._id?.toString() ?? ""
                        ))
                  ) {
                    console.log(
                      `increase service product ${serviceProduct._id}`
                    );
                    serviceProduct.quantity += 1;

                    const serviceProductsForHistory: ServiceProductHistoryObj =
                      {
                        id: serviceProduct._id,
                        name: serviceProduct.name,
                        addtionalPrice: serviceProduct.addtionalPrice,
                      };

                    servicesForHistory[
                      servicesForHistory.findIndex(
                        (obj) => obj.id?.toString() === serviceId.toString()
                      )
                    ].serviceProducts?.push(serviceProductsForHistory);
                  }
                }
              }
            }

            await store.save();

            const worker = store.workers.find(
              (worker) => worker._id?.toString() === order.workerId?.toString()
            );
            //console.log(worker);
            const newOrderHistory = new ORDERHISTORY({
              orderId: order._id,
              userId: order.userId,
              userName: user?.firstName + " " + user?.lastName,
              userPhone: user?.phone,
              storeId: store._id,
              services: servicesForHistory,
              isManual: order.isManual,
              status: "Rejected",
              totalPrice: order.totalPrice,
              totalDuration: order.totalDuration,
              date: order.date,
              endTime: order.endTime,
              hasRating: order.hasRating,
              workerId: order.workerId,
              workerName: worker?.firstName + " " + worker?.lastName,
              rejectedReason:
                "Auto Rejected (user does not pay the order for more than 5 minutes)",
            });
            //console.log("newOrderHistory: ", newOrderHistory);
            await newOrderHistory.save();
          }
        }
      }
    } catch (error) {
      console.error(
        "Error during cron job execution (auto reject for `Waiting for Payment`):",
        error
      );
    }
  });

  //set all worker isOnDuty property into false every midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log(
        "Starting cron job to set all workers' isOnDuty property to false."
      );

      // Use MongoDB's updateMany to update all workers in all stores
      const result = await STORES.updateMany(
        { "workers.isOnDuty": true }, // Only update if isOnDuty is true (optional, for optimization)
        { $set: { "workers.$[].isOnDuty": false } } // $[] updates all elements in the array
      );

      console.log(
        `Cron job completed. Matched documents: ${result.matchedCount}, Modified documents: ${result.modifiedCount}`
      );
    } catch (error) {
      console.error(
        "Error during cron job execution (set all worker isOnDuty property into false every midnight):",
        error
      );
    }
  });
};
