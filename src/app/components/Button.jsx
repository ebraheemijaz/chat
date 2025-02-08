import Link from 'next/link';

export default function Button({ href, children }) {
  return (
    <Link
      href={href}
      className="px-6 py-2 rounded-full text-[#32064A] bg-white border-2 border-transparent shadow transition hover:bg-transparent hover:border-white hover:text-white"
    >
      {children}
    </Link>
  );
}
