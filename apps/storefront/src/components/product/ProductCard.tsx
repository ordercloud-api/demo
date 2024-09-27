import {
  Card,
  CardBody,
  Center,
  Heading,
  Icon,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { BuyerProduct } from "ordercloud-javascript-sdk";
import { FunctionComponent } from "react";
import { TbPhoto } from "react-icons/tb";
import { Link as RouterLink } from "react-router-dom";
import formatPrice from "../../utils/formatPrice";

interface ProductCardProps {
  product: BuyerProduct<{ContentHub:any}>;
}


//TODO: needs work - should probably always be the same (see useProductImages on detail)
export const useDefaultProductImages = (product:BuyerProduct<{ContentHub:any}>) => {
  const urls = product.xp?.ContentHub?.pCMProductToAsset.results[0]?.urls;
  if (urls && Object.keys(urls).length) {
    return {
      thumbnail: Object.values(urls).find((u:any) => u.resource === 'thumbnail') as any,
      original: Object.values(urls).find((u:any) => u.resource === 'downloadOriginal') as any
    }
  }
  return {
    thumbnail: null,
    original: null,
  }
}

const ProductCard: FunctionComponent<ProductCardProps> = ({ product }) => {
  const {thumbnail} = useDefaultProductImages(product);
  return (
    <>
      {product && (
        <RouterLink
          to={`/products/${product.ID}`}
          style={{ textDecoration: "none" }}
        >
          <Card
            minH="333px"
            p={0}
            m={0}
            display="flex"
            h="full"
            transition="all .15s ease"
            border="1px solid transparent"
            _hover={{
              shadow: "md",
              transform: "translateY(-1px)",
              borderColor: "primary.100",
            }}
          >
            <CardBody
              m={0}
              p={0}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="stretch"
            >
              <Center
                bgColor="chakra-subtle-bg"
                aspectRatio="1 / 1"
                objectFit="cover"
                boxSize="100%"
                maxH="300px"
                borderTopRadius="md"
              >
                {thumbnail && thumbnail.url ? (
                  <Image
                    borderTopRadius="md"
                    boxSize="full"
                    objectFit="cover"
                    src={
                      thumbnail.url
                    }
                    zIndex={1}
                    bgColor="white"
                    onError={(e) => {
                      e.currentTarget.src = ""; // Prevent the broken image from rendering
                      e.currentTarget.style.display = "none"; // Hide the broken image
                    }}
                  />
                ) : (
                  <Icon fontSize="5rem" color="gray.300" as={TbPhoto} />
                )}
                <Icon
                  fontSize="5rem"
                  color="gray.300"
                  as={TbPhoto}
                  position="absolute"
                />
              </Center>

              <VStack w="full" minH={"120px"} alignItems="flex-start" p={6}>
                <Text fontSize="xs" color="chakra-subtle-text">
                  {product.ID}
                </Text>
                <Heading size="lg">{product.Name}</Heading>
                {product.PriceSchedule?.PriceBreaks && (
                  <Text fontSize="md" fontWeight="normal">
                    {formatPrice(
                      product?.PriceSchedule?.PriceBreaks[0].Price ?? 0
                    )}
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </RouterLink>
      )}
    </>
  );
};

export default ProductCard;
