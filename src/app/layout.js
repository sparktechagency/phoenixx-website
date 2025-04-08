"use client";
import "./globals.css";
import { ToastContainer } from 'react-toastify';
import Navbar from "@/components/Navber";
import { usePathname } from "next/navigation";
// import { Provider } from "react-redux";
// import { store } from "../../utils/store";
import 'react-toastify/dist/ReactToastify.css';



export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');
  return (
    <html lang="en">
      <body
        className={`antialiased`}
         cz-shortcut-listen="true"
      >
        {/* <Provider store={store}> */}
      {!isAuthPage && <Navbar />}
        {children}
        <ToastContainer position="top-center" autoClose={2000} />
        {/* </Provider> */}
      </body>
    </html>
  );
}
