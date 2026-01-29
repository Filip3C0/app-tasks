
import { setGlobalOptions } from "firebase-functions";
import { createUser } from "./createUser";
import { notifyFieldOnTicketCreated } from "./ticketNotifications";

export { createUser, notifyFieldOnTicketCreated };

setGlobalOptions({ maxInstances: 10 });

