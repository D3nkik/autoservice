import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingForm from '@/components/booking/BookingForm';

export default function BookingPage() {
  return (
    <>
      <Head>
        <title>Онлайн-запись — АвтоСервис</title>
      </Head>
      <Header />
      <main className="max-w-2xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Онлайн-запись</h1>
        <BookingForm />
      </main>
      <Footer />
    </>
  );
}
