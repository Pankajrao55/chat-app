import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Baseurl } from '../../services api/baseurl';

export default function Register() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    profile: null,
  });

  // ✅ Fix: Function to handle image preview safely
  const getProfileImage = () => {
    try {
      return user.profile ? URL.createObjectURL(user.profile) : 
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_aZ5dsa-PRx_4ozdsfmRi6kNoZdG18gCv8Em9EtWrHCYJD3OT5sKer3_UfZ4c2uc8lrg&usqp=CAU';
    } catch (error) {
      return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_aZ5dsa-PRx_4ozdsfmRi6kNoZdG18gCv8Em9EtWrHCYJD3OT5sKer3_UfZ4c2uc8lrg&usqp=CAU';
    }
  };

  // ✅ Fix: Handle input changes properly (including file input)
  const handleInput = (e) => {
    const { name, value, files } = e.target;

    if (name === 'profile' && files.length > 0) {
      setUser({ ...user, profile: files[0] });
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  // ✅ Fix: Handle form submission & ensure profile image is selected
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.profile) {
      return toast.error("Please select a profile picture");
    }

    try {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('email', user.email);
      formData.append('password', user.password);
      formData.append('profile', user.profile);

      const res = await axios.post(`${Baseurl}/api/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const data = res.data;

      if (res.status === 200) {
        toast.success(data.message);
        setUser({ name: '', email: '', password: '', profile: null });
        navigate('/login');
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <section className="bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-7 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-2 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Register
            </h1>
            <form className="space-y-2" onSubmit={handleSubmit}>
              {/* Profile Picture Upload */}
              <div>
                <label htmlFor="profile" className="flex text-white text-base px-5 py-0 outline-none rounded w-max cursor-pointer mx-auto font-[sans-serif]">
                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    className="rounded-[50%] w-[95px] h-[95px] object-cover"
                  />
                  <input 
                    type="file" 
                    id="profile" 
                    name="profile"  
                    onChange={handleInput} 
                    className="hidden" 
                    accept="image/*"
                  />
                </label>
              </div>

              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block mb-3 text-lg font-medium text-gray-900 dark:text-white">
                  Name
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={user.name} 
                  onChange={handleInput} 
                  id="name" 
                  placeholder="Enter your name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required 
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block mb-3 text-lg font-medium text-gray-900 dark:text-white">
                  Email
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={user.email} 
                  onChange={handleInput} 
                  id="email" 
                  placeholder="Enter your email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required 
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block mb-3 text-lg font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <input 
                  type="password" 
                  name="password" 
                  value={user.password} 
                  onChange={handleInput} 
                  id="password" 
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required 
                />
              </div>

              {/* Register Button */}
              <div>
                <button type="submit" className="mt-4 w-full bg-blue-500 text-white font-medium rounded-lg text-lg px-5 py-2 text-center">
                  Register
                </button>
              </div>

              {/* Redirect to Login */}
              <p className="text-white text-sm mt-8 text-center">
                Already registered?  
                <a 
                  href="#" 
                  className="text-blue-600 hover:underline ml-1 font-semibold" 
                  onClick={() => navigate('/login')}
                >
                  Login Here
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
