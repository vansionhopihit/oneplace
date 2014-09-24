require 'sinatra'
require 'data_mapper'
require 'haml'
require 'json'
require 'bcrypt'
require 'sinatra/flash'

require 'glorify'

require_relative 'routes'
require_relative 'helpers'
require_relative 'models'

enable :sessions
