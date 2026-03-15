import HomePage from '@/app/HomePage';

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  return <HomePage searchParams={resolvedSearchParams} />;
}
