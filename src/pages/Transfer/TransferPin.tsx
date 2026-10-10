import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "sonner";

import { formatNaira } from "@/lib/format";
import { apiRequest } from "@/lib/api";
import { isTransferPayload } from "@/lib/transfer";
import { useLockout } from "@/hooks/useLockout";

import { Button } from "@/components/ui/button";
import FlowShell from "@/components/shared/FlowShell";
import FlowHero from "@/components/shared/FlowHero";
import PinInput from "@/components/shared/PinInput";

type TransferApiResponse = {
  success: boolean;
  message: string;
  data: {
    transaction: {
      id: string;
      reference: string;
      type: string;
      status: string;
      direction: string;
      title: string;
      description: string;
      amount: string;
      fee: string;
      total: string;
      memo: string;
      currency: string;
      recipientName: string | null;
      recipientAccount: string | null;
      recipientBank: string | null;
      createdAt: string;
      updatedAt: string;
    };
    account: {
      accountNumber: string;
      balance: string;
      currency: string;
    };
  };
};

export default function TransferPin() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const payload = isTransferPayload(state) ? state : null;
  const lockout = useLockout();

  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!payload) {
      toast.error("Please start a new transfer.");
      navigate("/transfer", { replace: true });
    }
  }, [payload, navigate]);

  if (!payload) return null;

  const handleComplete = async (entered: string) => {
    if (verifying || lockout.locked) return;

    setVerifying(true);
    setErrorMessage("");

    try {
      const response = await apiRequest<TransferApiResponse>(
        "/transfers",
        {
          method: "POST",
          body: JSON.stringify({
            recipientName: payload.recipient.name,
            recipientAccount:
              payload.recipient.accountNumber ?? "",
            recipientBank:
              payload.recipient.bankName ?? "",
            amount: payload.amount.toString(),
            pin: entered,
            memo: payload.memo?.trim() || undefined,
          }),
        },
      );

      const transaction =
        response.data.transaction;

      /**
       * The backend is now the source of truth.
       *
       * Use:
       * - backend reference
       * - backend timestamp
       * - backend amount
       * - backend fee
       * - backend total
       *
       * instead of generating any of these
       * values on the frontend.
       */
      const completedPayload = {
        ...payload,

        amount: Number(transaction.amount),

        fee: Number(transaction.fee),

        total: Number(transaction.total),

        reference:
          transaction.reference,

        timestamp:
          transaction.createdAt,
      };

      navigate(
        "/transfer/processing",
        {
          state: completedPayload,
          replace: true,
        },
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to complete the transfer.";

      setPin("");

      setErrorMessage(message);

      /**
       * Only count an incorrect PIN as a
       * failed PIN attempt.
       *
       * Balance errors, server errors, etc.
       * should not trigger PIN lockout.
       */
      if (
        message.toLowerCase().includes(
          "invalid transaction pin",
        )
      ) {
        lockout.registerFailure();
      } else {
        toast.error(message);
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <FlowShell
      onBack={() =>
        navigate(
          "/transfer/confirm",
          { state: payload },
        )
      }
    >
      <p className="mb-2 text-center text-xs uppercase tracking-wider text-muted-foreground">
        Step 2 of 3
      </p>

      <FlowHero
        icon={Lock}
        iconColor="primary"
        title="Enter your PIN"
        description={`Enter your 4-digit transaction PIN to authorize this ${formatNaira(
          payload.amount,
        )} transfer to ${payload.recipient.name}.`}
      />

      <div className="mt-8">
        <PinInput
          value={pin}
          onChange={(value) => {
            setPin(value);

            if (errorMessage) {
              setErrorMessage("");
            }
          }}
          onComplete={handleComplete}
          error={Boolean(errorMessage)}
          disabled={
            lockout.locked ||
            verifying
          }
        />

        <p className="mt-4 min-h-5 text-center text-sm text-danger">
          {lockout.locked
            ? lockout.message
            : errorMessage}
        </p>
      </div>

      {lockout.locked ? (
        <div className="mt-2 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(
                "/transfer/confirm",
                { state: payload },
              )
            }
          >
            Cancel transfer
          </Button>
        </div>
      ) : (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Forgot your PIN?{" "}
          <Link
            to="/transaction-pin/reset"
            className="text-primary hover:underline"
          >
            Reset it
          </Link>
        </p>
      )}
    </FlowShell>
  );
}