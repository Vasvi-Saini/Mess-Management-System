import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Mess Management System
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Reduce food wastage, improve meal quality, and streamline hostel mess operations
              with our comprehensive management solution.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meal Attendance</CardTitle>
                  <CardDescription>
                    Students can opt-in/out of meals before cutoff time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Accurate headcount prediction helps reduce food wastage by 30-50%.
                    Automatic credits for meals opted out.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rating & Feedback</CardTitle>
                  <CardDescription>
                    Rate meals and submit structured complaints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Real-time quality feedback with anonymous complaint options.
                    Streak rewards for consistent raters.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>
                    Comprehensive insights for administrators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track attendance trends, ratings, wastage reduction, and
                    student credits with detailed analytics.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Mess Management System - Reducing food wastage, improving satisfaction</p>
        </div>
      </footer>
    </div>
  );
}
