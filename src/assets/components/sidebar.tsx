'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Sidebar() {
    return (
        <div className='w-16'>
        <div className=' w-[16rem] top-0 z-20  fixed h-screen border-r-[1px] border-gray-800 px-4 py-4'>
                <Image className='dark:block hidden' src="/gitfund-white.webp" alt="Gitfund logo" width={100} height={100}></Image>
                <Image className='dark:hidden block' src="/gitfund.webp" alt="Gitfund logo" width={100} height={100}></Image>

                <div>
                <div className='pt-7'>
                    <div className='text-[13px] text-gray-400 py-2'>Explore</div>
                    <Link href="/homepage">
                    <div className='rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a]  px-2 py-2 flex'>
                        <svg xmlns="http://www.w3.org/2000/svg" className='my-auto mr-2' width="20" height="20" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M11.307 9.739L15 9l-.739 3.693a2 2 0 0 1-1.568 1.569L9 15l.739-3.693a2 2 0 0 1 1.568-1.568"/></g></svg>Discover</div></Link>
                    <div className='rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex'>
                        <svg xmlns="http://www.w3.org/2000/svg" className='my-auto mr-2' width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 6.5h9.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C22 8.59 22 9.393 22 11.5m-10-5l-.633-1.267c-.525-1.05-1.005-2.106-2.168-2.542C8.69 2.5 8.108 2.5 6.944 2.5c-1.816 0-2.724 0-3.406.38A3 3 0 0 0 2.38 4.038C2 4.72 2 5.628 2 7.444V10.5c0 4.714 0 7.071 1.464 8.535C4.822 20.394 6.944 20.493 11 20.5h1m10 1l-2.147-2.147m0 0a3.43 3.43 0 0 0 1.004-2.424a3.429 3.429 0 1 0-1.004 2.424" color="currentColor"/></svg>Browse</div>
                    <div className='rounded-lg text-sm active:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex'><svg xmlns="http://www.w3.org/2000/svg" className='my-auto mr-2' width="20" height="20" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2.5c-3.81 0-6.5 2.743-6.5 6.119c0 1.536.632 2.572 1.425 3.56c.172.215.347.422.527.635l.096.112c.21.25.427.508.63.774c.404.531.783 1.128.995 1.834a.75.75 0 0 1-1.436.432c-.138-.46-.397-.89-.753-1.357a18 18 0 0 0-.582-.714l-.092-.11c-.18-.212-.37-.436-.555-.667C4.87 12.016 4 10.651 4 8.618C4 4.363 7.415 1 12 1s8 3.362 8 7.619c0 2.032-.87 3.397-1.755 4.5c-.185.23-.375.454-.555.667l-.092.109c-.21.248-.405.481-.582.714c-.356.467-.615.898-.753 1.357a.751.751 0 0 1-1.437-.432c.213-.706.592-1.303.997-1.834c.202-.266.419-.524.63-.774l.095-.112c.18-.213.355-.42.527-.634c.793-.99 1.425-2.025 1.425-3.561C18.5 5.243 15.81 2.5 12 2.5M8.75 18h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5m.75 3.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75"/></svg>Recommendations</div>
                </div>
                <div className='pt-7'>
                    <div className='text-[13px] text-gray-400 py-2'>Contributor</div>
                    <div className='rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" className='my-auto mr-2' height="20" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.009m3.986 0h.01m3.986 0H16m2 9c1.232 0 2.231-1.151 2.231-2.571c0-2.248-.1-3.742 1.442-5.52c.436-.502.436-1.316 0-1.818c-1.542-1.777-1.442-3.272-1.442-5.52C20.231 4.151 19.232 3 18 3M6 21c-1.232 0-2.231-1.151-2.231-2.571c0-2.248.1-3.742-1.442-5.52c-.436-.502-.436-1.316 0-1.818C3.835 9.353 3.769 7.84 3.769 5.57C3.769 4.151 4.768 3 6 3" color="currentColor"/></svg>Contributions</div>
                    <div className='rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex'><svg xmlns="http://www.w3.org/2000/svg" className='my-auto mr-2' width="20" height="20" viewBox="0 0 48 48"><defs><mask id="ipSSeoFolder0"><g fill="none" stroke-width="4"><path fill="#fff" stroke="#fff" stroke-linejoin="round" d="M5 8a2 2 0 0 1 2-2h12l5 6h17a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>
                    <path stroke="#000" stroke-linecap="round" stroke-linejoin="round" d="m14 22l5 5l-5 5"/><path stroke="#000" stroke-linecap="round" d="M26 32h8"/></g></mask></defs>
                    <path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSSeoFolder0)"/></svg>Projects</div>
                    <div className='rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex'><svg xmlns="http://www.w3.org/2000/svg" className='my-auto mr-2' width="20" height="20" viewBox="0 0 12 12">
                    <path fill="currentColor" d="M2.25 1C1.56 1 1 1.56 1 2.25v1.162a1.5 1.5 0 0 0 .772 1.31l2.876 1.599a3 3 0 1 0 2.704 0l2.877-1.598A1.5 1.5 0 0 0 11 3.412V2.25C11 1.56 10.44 1 9.75 1zM2 2.25A.25.25 0 0 1 2.25 2H4v2.817l-1.743-.968A.5.5 0 0 1 2 3.412zm3 3.122V2h2v3.372l-1 .556zm3-.555V2h1.75a.25.25 0 0 1 .25.25v1.162a.5.5 0 0 1-.257.437zM8 9a2 2 0 1 1-4 0a2 2 0 0 1 4 0"/></svg>Rewards</div>

                </div>
                <div className='pt-7'>
                    <div className='text-[13px] text-gray-400 py-2'>Maintainer</div>
                    <Link href="/create-project">
                    <div className='rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" className='my-auto mr-2' height="20" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.009m3.986 0h.01m3.986 0H16m2 9c1.232 0 2.231-1.151 2.231-2.571c0-2.248-.1-3.742 1.442-5.52c.436-.502.436-1.316 0-1.818c-1.542-1.777-1.442-3.272-1.442-5.52C20.231 4.151 19.232 3 18 3M6 21c-1.232 0-2.231-1.151-2.231-2.571c0-2.248.1-3.742-1.442-5.52c-.436-.502-.436-1.316 0-1.818C3.835 9.353 3.769 7.84 3.769 5.57C3.769 4.151 4.768 3 6 3" color="currentColor"/></svg>Submit a Project</div>
                    </Link>

                    <Link href="/myProjects">
                    <div className='rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex'>
                        <svg xmlns="http://www.w3.org/2000/svg"  className='my-auto mr-2' width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M13.5 5.88c-.28 0-.5-.22-.5-.5V1.5c0-.28-.22-.5-.5-.5h-9c-.28 0-.5.22-.5.5v2c0 .28-.22.5-.5.5S2 3.78 2 3.5v-2C2 .67 2.67 0 3.5 0h9c.83 0 1.5.67 1.5 1.5v3.88c0 .28-.22.5-.5.5"/><path fill="currentColor" d="M14.5 16h-13C.67 16 0 15.33 0 14.5v-10C0 3.67.67 3 1.5 3h4.75c.16 0 .31.07.4.2L8 5h6.5c.83 0 1.5.67 1.5 1.5v8c0 .83-.67 1.5-1.5 1.5M1.5 4c-.28 0-.5.22-.5.5v10c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-8c0-.28-.22-.5-.5-.5H7.75a.48.48 0 0 1-.4-.2L6 4z"/><path fill="currentColor" d="M5.5 13h-2c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h2c.28 0 .5.22.5.5s-.22.5-.5.5"/></svg>                    
                        My Projects</div>
                    </Link>
                </div>
                </div>
            </div>
        </div>
    )
}