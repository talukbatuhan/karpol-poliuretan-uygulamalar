import type { z } from "zod";

import { taskFormSchema } from "@/lib/validations/task-form";

export type TaskFormValues = z.infer<typeof taskFormSchema>;
