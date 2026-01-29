import { setGlobalOptions } from "firebase-functions";
import { createUser } from "./createUser";
import { registerFcmToken } from "./registerFcmToken";
import { notifyFieldOnTicketCreated } from "./ticketNotifications";

export { createUser, registerFcmToken, notifyFieldOnTicketCreated };

setGlobalOptions({ maxInstances: 10 });
