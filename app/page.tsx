import { TripList } from "@/components/trips/trip-list";
import { CreateTripForm } from "@/components/trips/create-trip-form";
import { getTrips } from "@/lib/actions/trips";

export default async function HomePage() {
  const trips = await getTrips();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-16">
      <section className="mt-6">
        <h1 className="text-3xl font-bold sm:text-4xl">Plan, split, settle.</h1>
        <p className="mt-3 text-base text-muted-foreground sm:max-w-2xl">
          SplitMate helps you track shared expenses for group trips. Add your crew, capture purchases in seconds, and see who owes what
          instantly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Create a new trip</h2>
        <p className="text-sm text-muted-foreground">Name your adventure, add who is coming along, then start recording expenses.</p>
        <CreateTripForm />
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-xl font-semibold">Trips</h2>
        <TripList trips={trips} />
      </section>
    </div>
  );
}
