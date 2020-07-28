class AddIndexToNameAndDescriptionOnProduct < ActiveRecord::Migration[5.2]
  def change
    add_index :products, :name
    add_index :products, :description
  end
end
