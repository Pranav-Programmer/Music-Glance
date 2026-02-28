'use client';

import Layout from '@/components/Layout';
import TicTacToe from '@/components/TicTacToe';
import Footer from '@/components/Footer';

export default function Tic_Tac_Toe() {

  return (
    <Layout>
        <div className="flex min-h-screen flex-col">
            <div className="flex-grow mt-16 mb-48">
                <TicTacToe showModeSelector={false}/>
            </div>
            <Footer/>
        </div>
    </Layout>
  );
}