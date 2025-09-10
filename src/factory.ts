import type { HttpBindings } from "@hono/node-server";
import { createFactory } from "hono/factory";

type Bindings = HttpBindings;

export interface AppBindings {
  Bindings: Bindings;
}

const factory = createFactory<AppBindings>();

export default factory;
