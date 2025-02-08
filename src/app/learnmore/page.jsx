import UserProfile from '../components/UserCard';
import Button from '../components/Button';

export default function LearnMorePage() {
  return (
    <div className="bg-[#32064A] text-white min-h-screen flex flex-col">
      <main className="flex-1 px-8 py-6">
        <h1 className="text-4xl font-bold text-center mb-4">What is coursebud?</h1>
        <p className="text-center text-lg mb-6">
          Simply put, coursebud is a website where you can get information about the college courses that you're
          interested in.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left Column: User Profile */}
          <div className="flex justify-center">
            <UserProfile
              name="Steven"
              course="French & History"
              college="University College Dublin"
              code="DU393"
              advice="Higher points doesn't mean better course!"
              description="Wasn't too sure what I wanted to study in college, but loved history in school!"
              bio="Happy to help! Shoot me a message!"
              isVerified={true}
            />
          </div>
          {/* Right Column: Description */}
          <div className="text-lg">
            <p className="mb-4">
              Profiles include information such as college name, course name, and course code. If you see a course you
              may be interested in, get in touch!
            </p>
            <p>
              Our goal is for you to get answers to the questions you have about your future college course. Your career
              guidance counsellor probably isn't the best person to ask about the nightlife in UCC, or how often you{' '}
              <strong>really</strong> need to attend a module.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}
