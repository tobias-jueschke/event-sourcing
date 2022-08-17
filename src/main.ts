// Represents a data store
// This is the event stream produced by the api handler methods
// IMPORTANT: this event stream is not equal to the events published by pub/sub
const domainEvents: any = [
  {
    handler: 'InitHandler',
    createdAt: new Date(2022, 8, 17, 10, 0, 0, 0).toISOString(),
    payload: {
      orderId: 1,
      deliveryAddress: {
        firstName: 'max',
        lastName: 'mustermann'
      }
    }
  },
  {
    handler: 'DeliveryAddressUpdatedHandler',
    createdAt: new Date(2022, 8, 17, 12, 15, 0, 0).toISOString(),
    payload: {
      firstName: 'alice',
      lastName: 'wonderland'
    }
  }
]

// Snapshots
const snapshots = [
  {
    createdAt: new Date(2022, 8, 17, 10, 0, 0, 0),
    payload: {
      orderId: 1, deliveryAddress: {firstName: 'egon', lastName: 'snapshot'}
    }
  },
  {
    createdAt: new Date(2022, 8, 17, 12, 0, 0, 0),
    payload: {
      orderId: 2, deliveryAddress: {firstName: 'hans', lastName: 'snapshot'}
    }
  }
];

// Projection
const projection = {}


class OrderDomain {
  private orderState: any = {}

  private readonly eventStream: any[] = [];

  public constructor() {
    // add initial snapshot
    const latestSnapshot = snapshots[snapshots.length - 1];
    // emit init event
    this.emitInitEvent(latestSnapshot.payload)

    // add all events following
    const events = domainEvents.filter((event: any) => new Date(event.createdAt).getTime() >= new Date(latestSnapshot.createdAt).getTime());

    this.eventStream = [...this.eventStream, ...events];
  }

  public emitInitEvent(order: any) {
    const event = {
      createdAt: new Date().toISOString(),
      handler: InitHandler.name,
      payload: order
    };

    domainEvents.push(event)

    this.eventStream.push(event);
  }

  public emitDeliveryAddressUpdatedEvent(firstName: string, lastName: string) {
    const event = {
      createdAt: new Date().toISOString(),
      handler: DeliveryAddressUpdatedHandler.name,
      payload: {
        firstName,
        lastName
      }
    };

    domainEvents.push(event)

    this.eventStream.push(event);
  }

  public emitUpdateOrderIdEvent(orderId: number) {
    const event = {
      createdAt: new Date().toISOString(),
      handler: OrderIdChangedHandler.name,
      payload: {
        orderId
      }
    }

    domainEvents.push(event)

    this.eventStream.push(event);
  }

  public createProjection() {
    this.eventStream.forEach((event) => {
      switch (event.handler) {
        case InitHandler.name:
          this.orderState = InitHandler.handle(this.orderState, event);
          break;
        case DeliveryAddressUpdatedHandler.name:
          this.orderState = DeliveryAddressUpdatedHandler.handle(this.orderState, event);
          break;
        case OrderIdChangedHandler.name:
          this.orderState = OrderIdChangedHandler.handle(this.orderState, event);
          break;
        default:
          throw new Error(`Handler ${event.handler} not implemented`)
      }

      console.log("Executed event: \n");
      console.log(`EventHandler: ${event.handler}`);
      console.log(`EventCreatedAt: ${event.createdAt}`);
      console.log(`EventBody: ${JSON.stringify(event.payload)}`);
      console.log(`Order: ${JSON.stringify(this.orderState)}`);
      console.log("\n");
    });

    return this.orderState;
  }
}

class OrderIdChangedHandler {
  public static handle(order: any, event: any) {
    return {...order, orderId: event.payload.orderId};
  }
}

class InitHandler {
  public static handle(order: any, event: any) {
    return {...order, ...event.payload};
  }
}

class DeliveryAddressUpdatedHandler {
  public static handle(order: any, event: any) {
    return {...order, deliveryAddress: event.payload};
  }
}

const orderDomain = new OrderDomain();
console.log("Result: \n");
console.log(orderDomain.createProjection());
//orderDomain.emitUpdateOrderIdEvent(22);
orderDomain.emitDeliveryAddressUpdatedEvent('hugo', 'bugo');
console.log(orderDomain.createProjection());
//console.log(orderDomain.createProjection());
//console.log(domainEvents);

