# encoding: UTF-8
helpers do
  def hash_to_query_string (hash)
    if hash
      hash.delete 'password'
      hash.delete 'password_confirmation'
      hash.collect {|k, v| "#{k}=#{v}"}.join('&')
    end
  end

  def current_user
    return @current_user ||= User.first(token: request.cookies["user"]) if request.cookies["user"]
    @current_user ||= User.first(token: session[:user]) if session[:user]
  end

  def show_date
    time = Time.now
    date = time.strftime("%x %a")
  end

end
