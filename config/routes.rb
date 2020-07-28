Rails.application.routes.draw do
  mount Pwa::Engine, at: ''

  get 'home/index'
  post 'home/push'
  post '/home/subscribe'
  resources :products

  root 'home#index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
