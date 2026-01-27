


import {setGlobalOptions} from "firebase-functions";
import { createUser } from "./createUser";
export { createUser };


setGlobalOptions({ maxInstances: 10 });

