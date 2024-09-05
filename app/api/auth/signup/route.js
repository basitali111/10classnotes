import { hash } from 'bcryptjs';
import { connectToDatabase } from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(req) {
  try {
    const body = await req.json(); // Parsing JSON body from the request
    const { email, password } = body;

    // Check if the user already exists
    await connectToDatabase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return new Response(JSON.stringify({ message: 'User already exists' }), {
        status: 400,
      });
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      email,
      password: hashedPassword, // store the hashed password
    });

    return new Response(
      JSON.stringify({ message: 'User created successfully', user: newUser }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error creating user' }), {
      status: 500,
    });
  }
}

export const GET = async () => {
  return new Response(
    JSON.stringify({ message: 'Method not allowed' }),
    { status: 405 }
  );
};
