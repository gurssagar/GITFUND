"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "./SidebarContext";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useBalance } from "wagmi";
import { useSession } from "next-auth/react";

export default function Sidebar() {
  const { open } = useAppKit();
  const { data: session } = useSession(); // Added useAccount and useBalance
  const { isShrunk } = useSidebarContext();
  const { address, isConnected } = useAccount(); // Get account status and address
  const {
    data: balanceData,
    error: balanceError,
    isLoading: isBalanceLoading,
  } = useBalance({
    address: address,
  });
  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 10)}...${addr.substring(addr.length - 6)}`;
  };

  return (
    <div>
      <div
        className={
          (isShrunk ? "w-[4rem] mx-auto px-1" : "w-[16rem] px-4") +
          " top-0 z-50 bg-white dark:bg-black fixed h-screen border-r-[1px] dark:border-custom-dark-gray py-4 transition-all duration-400 ease-in-out"
        }
        style={{ transitionProperty: "width, padding" }}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {isShrunk ? (
              <>
                <Image
                  className="dark:block hidden"
                  src="/gitfund-white-icon.webp"
                  alt="Gitfund logo"
                  width={isShrunk ? 40 : 100}
                  height={isShrunk ? 40 : 100}
                ></Image>
                <Image
                  className="dark:hidden block"
                  src="/gitfund-black-icon.webp"
                  alt="Gitfund logo"
                  width={isShrunk ? 40 : 100}
                  height={isShrunk ? 40 : 100}
                ></Image>
              </>
            ) : (
              <>
                <Image
                  className="dark:block hidden"
                  src="/gitfund-white.webp"
                  alt="Gitfund logo"
                  width={isShrunk ? 40 : 100}
                  height={isShrunk ? 40 : 100}
                ></Image>
                <Image
                  className="dark:hidden block"
                  src="/gitfund.webp"
                  alt="Gitfund logo"
                  width={isShrunk ? 40 : 100}
                  height={isShrunk ? 40 : 100}
                ></Image>
              </>
            )}
            <div>
              <div className="pt-7">
                {!isShrunk && (
                  <div className="text-[13px] text-gray-400 py-2">Explore</div>
                )}
                <Link href="/homepage">
                  <div className="rounded-lg text-sm focus:bg-gray-400 text-white hover:bg-gray-100 dark:hover:bg-[#27272a]  px-2 py-2 flex">
                    
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="my-auto mr-2"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M11.307 9.739L15 9l-.739 3.693a2 2 0 0 1-1.568 1.569L9 15l.739-3.693a2 2 0 0 1 1.568-1.568" />
                      </g>
                    </svg>
                    {!isShrunk && "Discover"}
                  </div>
                </Link>

                <Link href={`/Browse`}>
                  <div className="rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="my-auto mr-2"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M7 6.5h9.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C22 8.59 22 9.393 22 11.5m-10-5l-.633-1.267c-.525-1.05-1.005-2.106-2.168-2.542C8.69 2.5 8.108 2.5 6.944 2.5c-1.816 0-2.724 0-3.406.38A3 3 0 0 0 2.38 4.038C2 4.72 2 5.628 2 7.444V10.5c0 4.714 0 7.071 1.464 8.535C4.822 20.394 6.944 20.493 11 20.5h1m10 1l-2.147-2.147m0 0a3.43 3.43 0 0 0 1.004-2.424a3.429 3.429 0 1 0-1.004 2.424"
                        color="currentColor"
                      />
                    </svg>
                    {!isShrunk && "Browse"}
                  </div>
                </Link>
                <Link href="/GitBot">
                  <div className="rounded-lg text-sm active:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="my-auto mr-2"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12 2.5c-3.81 0-6.5 2.743-6.5 6.119c0 1.536.632 2.572 1.425 3.56c.172.215.347.422.527.635l.096.112c.21.25.427.508.63.774c.404.531.783 1.128.995 1.834a.75.75 0 0 1-1.436.432c-.138-.46-.397-.89-.753-1.357a18 18 0 0 0-.582-.714l-.092-.11c-.18-.212-.37-.436-.555-.667C4.87 12.016 4 10.651 4 8.618C4 4.363 7.415 1 12 1s8 3.362 8 7.619c0 2.032-.87 3.397-1.755 4.5c-.185.23-.375.454-.555.667l-.092.109c-.21.248-.405.481-.582.714c-.356.467-.615.898-.753 1.357a.751.751 0 0 1-1.437-.432c.213-.706.592-1.303.997-1.834c.202-.266.419-.524.63-.774l.095-.112c.18-.213.355-.42.527-.634c.793-.99 1.425-2.025 1.425-3.561C18.5 5.243 15.81 2.5 12 2.5M8.75 18h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5m.75 3.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75"
                      />
                    </svg>
                    {!isShrunk && "Recommendations"}
                  </div>
                </Link>
              </div>
              <div className="pt-7">
                {!isShrunk && (
                  <div className="text-[13px] text-gray-400 py-2">
                    Contributor
                  </div>
                )}
                <Link href="/contributions">
                  <div className="rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      className="my-auto mr-2"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M8 12h.009m3.986 0h.01m3.986 0H16m2 9c1.232 0 2.231-1.151 2.231-2.571c0-2.248-.1-3.742 1.442-5.52c.436-.502.436-1.316 0-1.818c-1.542-1.777-1.442-3.272-1.442-5.52C20.231 4.151 19.232 3 18 3M6 21c-1.232 0-2.231-1.151-2.231-2.571c0-2.248.1-3.742-1.442-5.52c-.436-.502-.436-1.316 0-1.818C3.835 9.353 3.769 7.84 3.769 5.57C3.769 4.151 4.768 3 6 3"
                        color="currentColor"
                      />
                    </svg>
                    {!isShrunk && "Contributions"}
                  </div>
                </Link>
                <Link href={{
                  pathname: '/userProfile',
                  query: {
                    user: (session?.user as any)?.username,
                  },
                }}>
                  <div className="rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      className="my-auto mr-2"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M8 12h.009m3.986 0h.01m3.986 0H16m2 9c1.232 0 2.231-1.151 2.231-2.571c0-2.248-.1-3.742 1.442-5.52c.436-.502.436-1.316 0-1.818c-1.542-1.777-1.442-3.272-1.442-5.52C20.231 4.151 19.232 3 18 3M6 21c-1.232 0-2.231-1.151-2.231-2.571c0-2.248.1-3.742-1.442-5.52c-.436-.502-.436-1.316 0-1.818C3.835 9.353 3.769 7.84 3.769 5.57C3.769 4.151 4.768 3 6 3"
                        color="currentColor"
                      />
                    </svg>
                    {!isShrunk && "User Profile"}
                  </div>
                </Link>
                <Link href="/assignedProjects" className="">
                  <div className="rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="my-auto mr-2"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                    >
                      <defs>
                        <mask id="ipSSeoFolder0">
                          <g fill="none" stroke-width="4">
                            <path
                              fill="#fff"
                              stroke="#fff"
                              stroke-linejoin="round"
                              d="M5 8a2 2 0 0 1 2-2h12l5 6h17a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"
                            />
                            <path
                              stroke="#000"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="m14 22l5 5l-5 5"
                            />
                            <path
                              stroke="#000"
                              stroke-linecap="round"
                              d="M26 32h8"
                            />
                          </g>
                        </mask>
                      </defs>
                      <path
                        fill="currentColor"
                        d="M0 0h48v48H0z"
                        mask="url(#ipSSeoFolder0)"
                      />
                    </svg>
                    {!isShrunk && "Projects"}
                  </div>
                </Link>
                <a href="Rewards">
                  <div className="rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="my-auto mr-2"
                      width="20"
                      height="20"
                      viewBox="0 0 12 12"
                    >
                      <path
                        fill="currentColor"
                        d="M2.25 1C1.56 1 1 1.56 1 2.25v1.162a1.5 1.5 0 0 0 .772 1.31l2.876 1.599a3 3 0 1 0 2.704 0l2.877-1.598A1.5 1.5 0 0 0 11 3.412V2.25C11 1.56 10.44 1 9.75 1zM2 2.25A.25.25 0 0 1 2.25 2H4v2.817l-1.743-.968A.5.5 0 0 1 2 3.412zm3 3.122V2h2v3.372l-1 .556zm3-.555V2h1.75a.25.25 0 0 1 .25.25v1.162a.5.5 0 0 1-.257.437zM8 9a2 2 0 1 1-4 0a2 2 0 0 1 4 0"
                      />
                    </svg>
                    {!isShrunk && "Rewards"}
                  </div>
                </a>
              </div>
              <div className="pt-3">
                {!isShrunk && (
                  <div className="text-[13px] text-gray-400 py-2">
                    Maintainer
                  </div>
                )}
                <Link href="/contributorRequests">
                  <div className="rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      className="my-auto mr-2"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M8 12h.009m3.986 0h.01m3.986 0H16m2 9c1.232 0 2.231-1.151 2.231-2.571c0-2.248-.1-3.742 1.442-5.52c.436-.502.436-1.316 0-1.818c-1.542-1.777-1.442-3.272-1.442-5.52C20.231 4.151 19.232 3 18 3M6 21c-1.232 0-2.231-1.151-2.231-2.571c0-2.248.1-3.742-1.442-5.52c-.436-.502-.436-1.316 0-1.818C3.835 9.353 3.769 7.84 3.769 5.57C3.769 4.151 4.768 3 6 3"
                        color="currentColor"
                      />
                    </svg>
                    {!isShrunk && "Contribution Requests"}
                  </div>
                </Link>

                <Link href="/myProjects">
                  <div className="rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="my-auto mr-2"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill="currentColor"
                        d="M13.5 5.88c-.28 0-.5-.22-.5-.5V1.5c0-.28-.22-.5-.5-.5h-9c-.28 0-.5.22-.5.5v2c0 .28-.22.5-.5.5S2 3.78 2 3.5v-2C2 .67 2.67 0 3.5 0h9c.83 0 1.5.67 1.5 1.5v3.88c0 .28-.22.5-.5.5"
                      />
                      <path
                        fill="currentColor"
                        d="M14.5 16h-13C.67 16 0 15.33 0 14.5v-10C0 3.67.67 3 1.5 3h4.75c.16 0 .31.07.4.2L8 5h6.5c.83 0 1.5.67 1.5 1.5v8c0 .83-.67 1.5-1.5 1.5M1.5 4c-.28 0-.5.22-.5.5v10c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-8c0-.28-.22-.5-.5-.5H7.75a.48.48 0 0 1-.4-.2L6 4z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.5 13h-2c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h2c.28 0 .5.22.5.5s-.22.5-.5.5"
                      />
                    </svg>
                    {!isShrunk && "My Projects"}
                  </div>
                </Link>
                <Link href="/PullRequests" >
                  <div className="rounded-lg gap-2 text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"><path d="M37 44a4 4 0 1 0 0-8a4 4 0 0 0 0 8ZM11 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8Zm0 32a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z"/><path stroke-linecap="round" d="M11 12v24m13-26h9a4 4 0 0 1 4 4v22"/><path stroke-linecap="round" d="m30 16l-6-6l6-6"/></g></svg>
                    {!isShrunk && "Pull Requests"}
                  </div>
                </Link>
                <Link href="/gitfundChat">
                  <div className="rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] pl-1 pr-4 py-2 flex">
                    <div className="flex gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g fill="none" stroke="currentColor" stroke-width="1">
                          <path d="M4 12a8 8 0 1 1 16 0v5.09c0 .848 0 1.27-.126 1.609a2 2 0 0 1-1.175 1.175C18.36 20 17.937 20 17.09 20H12a8 8 0 0 1-8-8Z" />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 11h6m-3 4h3"
                          />
                        </g>
                      </svg>
                      {!isShrunk && "Gitfund Chat"}
                    </div>
                  </div>
                </Link>
              </div>
            </div>{" "}
            {/* End of wrapper for top content */}
            <div
              onClick={() => open()}
              className="fixed bottom-10 px-4 py-2 dark:bg-custom-dark-gray bg-gray-200 dark:text-white text-black  rounded-lg cursor-pointer text-center mb-4"
            >
              {isConnected ? (
                isShrunk ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="mx-auto"
                  >
                    <path
                      fill="currentColor"
                      d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2m0 14H4V6h16zM6 10h8v2H6zm0 4h5v2H6z"
                    />
                  </svg>
                ) : (
                  <>
                    <div
                      onClick={() => {
                        open;
                      }}
                    >
                      <div className="flex gap-2">
                        <div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            className="mx-auto"
                          >
                            <path
                              fill="currentColor"
                              d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2m0 14H4V6h16zM6 10h8v2H6zm0 4h5v2H6z"
                            />
                          </svg>
                        </div>
                        {truncateAddress(address as string)}
                      </div>
                    </div>
                  </>
                )
              ) : isShrunk ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  className="mx-auto"
                >
                  <path
                    fill="currentColor"
                    d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2m0 14H4V6h16zM6 10h8v2H6zm0 4h5v2H6z"
                  />
                </svg>
              ) : (
                "Connect Wallet"
              )}
            </div>
          </div>{" "}
          {/* End of flex container */}
        </div>
      </div>
    </div>
  );
}
