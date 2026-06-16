import "./globals.css";

export const metadata = {
  title: "devChart — Club Kanban",
  description: "Project collaboration board for student clubs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
