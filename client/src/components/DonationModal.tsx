import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DonationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (cart_item_id: number) => void;  // Updated to pass ID
  item: {
    cart_item_id: number;
    quantity: number;
    product: {
      name: string;
      expiry_date?: string;
      image?: string;
    };
  } | null;
}

export const DonationModal = ({
  open,
  onClose,
  onConfirm,
  item,
}: DonationModalProps) => {
  if (!open || !item) return null;

  const rawExpiry = item.product.expiry_date;
  const expiryDate = rawExpiry ? new Date(rawExpiry) : new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / msPerDay);

  const handleDonate = () => {
    onConfirm(item.cart_item_id); // Pass ID for removal
    onClose();                    // Close modal
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Donate {item.product.name}?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            This item expires{" "}
            <strong>
              {daysUntilExpiry >= 0
                ? `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}`
                : "today"}
            </strong>
            .
          </p>
          <Button onClick={handleDonate}>Yes, donate it</Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
