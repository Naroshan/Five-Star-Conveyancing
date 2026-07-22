import { z } from 'zod';
export declare const transactionTypeSchema: z.ZodEnum<{
    sale: "sale";
    purchase: "purchase";
    sale_and_purchase: "sale_and_purchase";
    remortgage: "remortgage";
    transfer_of_equity: "transfer_of_equity";
    lease_extension: "lease_extension";
}>;
export declare const clientAnswersSchema: z.ZodObject<{
    transactionType: z.ZodEnum<{
        sale: "sale";
        purchase: "purchase";
        sale_and_purchase: "sale_and_purchase";
        remortgage: "remortgage";
        transfer_of_equity: "transfer_of_equity";
        lease_extension: "lease_extension";
    }>;
    postcode: z.ZodString;
    jurisdiction: z.ZodEnum<{
        england: "england";
        wales: "wales";
    }>;
    propertyValue: z.ZodNumber;
    freeholdOrLeasehold: z.ZodEnum<{
        freehold: "freehold";
        leasehold: "leasehold";
    }>;
    mortgageInvolved: z.ZodBoolean;
    lenderId: z.ZodOptional<z.ZodString>;
    flags: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
}, z.core.$strip>;
export type ValidatedClientAnswers = z.infer<typeof clientAnswersSchema>;
export declare function validateClientAnswers(body: unknown): z.ZodSafeParseResult<{
    transactionType: "sale" | "purchase" | "sale_and_purchase" | "remortgage" | "transfer_of_equity" | "lease_extension";
    postcode: string;
    jurisdiction: "england" | "wales";
    propertyValue: number;
    freeholdOrLeasehold: "freehold" | "leasehold";
    mortgageInvolved: boolean;
    flags: Record<string, boolean>;
    lenderId?: string | undefined;
}>;
