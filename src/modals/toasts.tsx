import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { api } from "../utils/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Checkbox } from "~/components/ui/checkbox";

import type { ReactNode } from "react";
import type { Toast } from "@prisma/client";
import { Combobox } from "~/components/ui/combobox";

const ToastFormSchema = z.object({
  dateToBeDone: z.date(),
  occasionId: z.string().min(1),
  userId: z.string().min(1),
  wasDone: z.boolean().optional(),
});

export const AddToastModal = NiceModal.create(() => {
  const modal = useModal();

  const utils = api.useContext();

  const { mutateAsync } = api.toast.create.useMutation({
    onSuccess: () => {
      utils.toast.invalidate().catch((e) => {
        console.error(e);
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof ToastFormSchema>) => {
    await mutateAsync(values);
    closeModal();
  };

  const closeModal = () => void modal.hide();

  return (
    <Dialog
      open={modal.visible}
      onOpenChange={(open) => {
        if (!open) {
          closeModal();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הוספת שתיה</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <ToastForm
          onSubmit={onSubmit}
          footer={
            <DialogFooter>
              <Button type="submit">יצירה</Button>
            </DialogFooter>
          }
        />
      </DialogContent>
    </Dialog>
  );
});

export const EditToastModal = NiceModal.create(
  ({ toast }: { toast: Toast }) => {
    const modal = useModal();

    const utils = api.useContext();

    const { mutateAsync } = api.toast.update.useMutation({
      onSuccess: () => {
        utils.toast.invalidate().catch((e) => {
          console.error(e);
        });
      },
    });

    const onSubmit = async (values: z.infer<typeof ToastFormSchema>) => {
      await mutateAsync({ ...values, id: toast.id });
      closeModal();
    };

    const closeModal = () => void modal.hide();

    return (
      <Dialog
        open={modal.visible}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>עריכת שתיה</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <ToastForm
            onSubmit={onSubmit}
            defaultValues={toast}
            footer={
              <DialogFooter>
                <Button type="submit">עריכה</Button>
              </DialogFooter>
            }
          />
        </DialogContent>
      </Dialog>
    );
  }
);

const ToastForm = ({
  onSubmit,
  defaultValues,
  footer,
}: {
  onSubmit: (values: z.infer<typeof ToastFormSchema>) => Promise<void>;
  defaultValues?: Toast;
  footer: ReactNode;
}) => {
  const form = useForm({
    resolver: zodResolver(ToastFormSchema),
    defaultValues: defaultValues ?? {
      wasDone: false,
      dateToBeDone: new Date(),
    },
  });

  const { data: occasions } = api.occasion.getAll.useQuery();
  const { data: users } = api.user.getAll.useQuery();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="occasionId"
          render={({ field }) => {
            const getSelectedOccasion = () => {
              const occasion = occasions?.find(
                (occasion) => occasion.id === field.value
              );

              if (!occasion) return;

              return {
                label: occasion.name,
                id: occasion.id,
              };
            };

            return (
              <FormItem className="flex flex-col">
                <FormLabel>אירוע</FormLabel>
                <Combobox
                  items={occasions?.map(({ name, id }) => ({
                    label: name,
                    id,
                  }))}
                  selectedItem={getSelectedOccasion()}
                  onChange={(value) => {
                    form.setValue("occasionId", value);
                  }}
                />
                <FormDescription>לשם מה אנחנו מתכנסים?</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => {
            const getSelectedUser = () => {
              const user = users?.find((user) => user.id === field.value);

              if (!user) return;

              return {
                label: user.name,
                id: user.id,
              };
            };

            return (
              <FormItem className="flex flex-col">
                <FormLabel>מארגן</FormLabel>
                <Combobox
                  items={users?.map(({ name, id }) => ({
                    label: name,
                    id,
                  }))}
                  selectedItem={getSelectedUser()}
                  onChange={(value) => {
                    form.setValue("userId", value);
                  }}
                />
                <FormDescription>בחר מארגן</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="wasDone"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="p-4">
                <FormLabel>האם נעשה</FormLabel>
              </div>
            </FormItem>
          )}
        />
        {footer}
      </form>
    </Form>
  );
};
