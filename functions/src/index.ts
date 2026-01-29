import { setGlobalOptions } from "firebase-functions";
import { createUser } from "./createUser";
import { registerFcmToken } from "./registerFcmToken";
import { notifyFieldOnTicketCreatedV2 } from "./ticketNotifications";

export { createUser, registerFcmToken, notifyFieldOnTicketCreatedV2 };

setGlobalOptions({ maxInstances: 10 });
