import Swal from 'sweetalert2';
import { enquiryApi } from '@/shared/api/endpoints';
import type { EnquiryPayload, Product } from '@/shared/api/types';
import { enquiryForm } from '@/shared/config';
import type { PhoneValue } from '@/shared/ui/fields/types';
import { Modal } from '@/shared/ui/Modal';
import { FormRenderer } from '@/shared/ui/renderer/FormRenderer';

interface EnquiryFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: PhoneValue;
  query: string;
  website?: string;
}

interface EnquiryModalProps {
  product: Pick<Product, 'id' | 'title'>;
  onClose: () => void;
}

/** Maps form values (shaped by config) to the API contract. */
export function toPayload(productId: number, values: EnquiryFormValues): EnquiryPayload {
  return {
    productId,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    countryCode: values.phone.countryCode,
    phone: values.phone.number.trim(),
    query: values.query.trim(),
    website: values.website ?? '',
  };
}

export function EnquiryModal({ product, onClose }: EnquiryModalProps) {
  async function handleSubmit(values: EnquiryFormValues) {
    const result = await enquiryApi.submit(toPayload(product.id, values));
    onClose();
    await Swal.fire({
      icon: 'success',
      title: 'Thank you!',
      text: result.message ?? 'We have received your enquiry and will get back to you soon.',
      confirmButtonText: 'Close',
    });
  }

  return (
    <Modal title={`${enquiryForm.title ?? 'Enquire'}: ${product.title}`} onClose={onClose}>
      <FormRenderer<EnquiryFormValues> config={enquiryForm} onSubmit={handleSubmit} testId="enquiry-form" />
    </Modal>
  );
}
