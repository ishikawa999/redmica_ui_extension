# frozen_string_literal: true

require 'application_helper'

module SearchableSelectbox
  module ApplicationHelperPatch
    def self.included(base)
      base.send(:prepend, InstanceMethods)
    end

    module InstanceMethods
      # Returns a string for users/groups option tags
      def principals_options_for_select(collection, selected=nil)
        s = +''
        if collection.include?(User.current)
          s << content_tag('option', "<< #{l(:label_me)} >>", :value => User.current.id)
        end
        groups = +''
        collection.sort.each do |element|
          if option_value_selected?(element, selected) || element.id.to_s == selected
            selected_attribute = ' selected="selected"'
          end
          (element.is_a?(Group) ? groups : s) <<
            %(<option value="#{element.id}"#{selected_attribute} data-select2-search-str="#{element.try(:login)}">#{h element.name}</option>)
        end
        unless groups.empty?
          s << %(<optgroup label="#{h(l(:label_group_plural))}">#{groups}</optgroup>)
        end
        s.html_safe
      end
    end
  end
end
