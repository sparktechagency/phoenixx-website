import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Collapse } from "antd";

const FaqList = ({ faqs }) => {
  if (faqs.length === 0) {
    return (
      <div className="text-start py-8">
        <p className="text-gray-500">No FAQs found in this category.</p>
      </div>
    );
  }

  // Convert faqs array to items format expected by Collapse
  const faqItems = faqs.map((faq) => ({
    key: faq._id,
    label: <div className="text-base font-medium">{faq.question}</div>,
    children: <p className="text-gray-600">{faq.answer}</p>,
    className: "mb-4 bg-white rounded-md border border-gray-200"
  }));

  return (
    <Collapse
      items={faqItems}
      bordered={false}
      expandIcon={({ isActive }) =>
        isActive ?
          <MinusOutlined className="text-blue-600" /> :
          <PlusOutlined className="text-blue-600" />
      }
      className="bg-transparent"
      expandIconPosition="end"
    />
  );
};

export default FaqList;
