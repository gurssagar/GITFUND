'use client';


export default function Issue({image, Project, Fork, Stars, Contributors, shortDescription}: {image: string, Project: string, Fork: number, Stars: number, Contributors: number, shortDescription: string}){
    return(
        <>
        <div className="p-4 rounded-xl border-1 border-gray-400 dark:border-gray-800">
            <div className="flex">
                <div className="mr-4">
                    <img src={image} className="rounded" width={48} height={48} alt="avatar" />
                </div>
                <div>
                    <h3>
                        {Project}
                    </h3>
                    <div className="flex">
                        <div className="flex text-gray-400 px-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="my-auto" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m12 17.275l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525.2t-.575-.15z"/></svg>
                        <p className="text-[15px]">{Stars}</p>
                        </div>
                        <div className="flex px-1 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="my-auto"  width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M22 5a3 3 0 1 0-4 2.816V11H6V7.816a3 3 0 1 0-2 0V11a2 2 0 0 0 2 2h5v4.184a3 3 0 1 0 2 0V13h5a2 2 0 0 0 2-2V7.816A2.99 2.99 0 0 0 22 5"/></svg>                        
                        <p className="text-[15px]">{Fork}</p>
                        </div>
                        <div className="flex px-1 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="my-auto" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20.75a1 1 0 0 0 1-1v-1.246c.004-2.806-3.974-5.004-8-5.004s-8 2.198-8 5.004v1.246a1 1 0 0 0 1 1zM15.604 6.854a3.604 3.604 0 1 1-7.208 0a3.604 3.604 0 0 1 7.208 0"/></svg>                       
                        <p className="text-[15px]">{Contributors}</p>
                        </div>
                    </div>
                </div>
                
            </div>
            <div className="pt-5">
                    <div>
                        <h3 className="text-[13px] text-gray-400">
                            {shortDescription}
                        </h3>
                    </div>
                </div>
                <div>

            </div>
        </div>
        </>
    )
}