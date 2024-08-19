import React from 'react'
import Image from 'next/image'
import Bat from '@/public/images/nav-bat.svg'

const Navbat = () => {
    return (
        <section>
            <Image src={Bat} alt="bat"
                width={100} height={100}
                className="navbat"
            />
        </section>
    )
}

export default Navbat