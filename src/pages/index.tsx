import { stripe } from "~/lib/stripe";
import { type GetStaticProps } from "next";
import { type Stripe } from "stripe";
import { useKeenSlider } from 'keen-slider/react'
import Image from "next/legacy/image";

import { HomeContainer, Product } from "~/styles/pages/home";

import 'keen-slider/keen-slider.min.css'
import Link from "next/link";

interface HomeProps {
  products: {
    id: string;
    name: string;
    imageUrl:string;
    price: number
  }[]
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48
    }
  })

  return (
    <HomeContainer ref={sliderRef} className="keen-slider" >
      {products.map(product => {
        return (
          <Link key={product.id} href={`/product/${product.id}`}>
            <Product className="keen-slider__slide">
              <Image src={product.imageUrl} alt="" width={500} height={500} />
              <footer>
                <strong>{product.name}</strong>
                <span>{product.price}</span>
              </footer>
            </Product>
          </Link>
        )
      })}

    </HomeContainer>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price']
  })

  const products = response.data.map(product => {
    const price = product.default_price as Stripe.Price;
    const unitAmount = (price.unit_amount as number) / 100;

    const formatedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(unitAmount)

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: formatedValue
    }
  })

  return {
    props: {
      products
    },
    revalidate: 60 * 60 * 2
  }
}

