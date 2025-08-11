import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "../../../mdx-components";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

type Props = {
  params: Promise<{
    mdxPath: string[];
  }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  return metadata;
}

// @ts-expect-error - wrapper is a function that returns a component
const Wrapper = getMDXComponents().wrapper;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Page(props: any) {
  const params = await props.params;
  const {
    default: MDXContent,
    toc,
    metadata,
    // @ts-expect-error - sourceCode is not defined in the type
    sourceCode,
  } = await importPage(params.mdxPath);
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}
