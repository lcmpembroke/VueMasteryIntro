
var eventBus = new Vue()

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>    
    `
})

Vue.component('product-review',{
  template: `
    <div>
      <form class="review-form" @submit.prevent="onSubmit">

      <p v-if="errors.length">
        <b>Please correct the error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>
      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
      </p>

      <p>
        <label for="review">Review:</label>      
        <textarea id="review" v-model="review"></textarea>
      </p>

      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

      <p>
      Would you recommend this product?</label>
      <input type="radio" name="recommended" value="yes" v-model="recommended"> Yes
      <input type="radio" name="recommended" value="no" v-model="recommended"> No
      </p>
          
      <p>
        <input type="submit" value="Submit">  
      </p>    

      </form>    

    </div>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommended: null,
      errors: []
    }
  },
  methods: {
    onSubmit() {

      console.log(this.recommended)
      if (this.name && this.review && this.rating && this.recommended) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommended: this.recommended
        }
        eventBus.$emit('review-submitted', productReview)
        this.name = null
        this.review = null
        this.rating = null
        this.recommended = null
        this.errors = []
      }
      else {
        if (!this.name) this.errors.push("Name is required")
        if (!this.review) this.errors.push("Review is required")
        if (!this.rating) this.errors.push("Rating is required")
        if (!this.recommended) this.errors.push("Please state if you would recommend this product.")
      }
    }
  } 
})

Vue.component('product', {
    props: {
      premium: {
        type: Boolean,
        required: true
      }
    },
    template: `
     <div class="product">
          
        <div class="product-image">
          <img :src="image" />
        </div>
  
        <div class="product-info">
            <h1>{{ product }}</h1>
            <p v-if="inStock">In Stock</p>
            <p v-else>Out of Stock</p>


            <info-tabs :shipping="shipping" :details="details"></info-tabs>
  
            <div class="color-box"
                 v-for="(variant, index) in variants" 
                 :key="variant.variantId"
                 :style="{ backgroundColor: variant.variantColor }"
                 @mouseover="updateProduct(index)"
                 >
            </div> 
  
            <button v-on:click="addToCart" 
              :disabled="!inStock"
              :class="{ disabledButton: !inStock }"
              >
            Add to cart
            </button>

            <button @click="removeFromCart">
            Remove item from cart
            </button>            
            
            <product-tabs :reviews="reviews"></product-tabs>

        </div>  
         
      </div>
     `,
    data() {
      return {
          product: 'Socks',
          brand: 'Vue Mastery',
          selectedVariant: 0,
          details: ['80% cotton', '20% polyester', 'Gender-neutral'],
          variants: [
            {
              variantId: 2234,
              variantColor: 'green',
              variantImage:  'https://www.vuemastery.com/images/challenges/vmSocks-green-onWhite.jpg',
              variantQuantity: 10     
            },
            {
              variantId: 2235,
              variantColor: 'blue',
              variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-blue-onWhite.jpg',
              variantQuantity: 0     
            }
          ],
          reviews: []
      }
    },
    methods: {
        addToCart: function() {
            this.$emit('add-to-cart',this.variants[this.selectedVariant].variantId)
        },
        updateProduct: function(index) {  
            this.selectedVariant = index
        },
        removeFromCart() {
          this.$emit('remove-from-cart',this.variants[this.selectedVariant].variantId)
        },
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product  
        },
        image(){
            return this.variants[this.selectedVariant].variantImage
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping() {
        if (this.premium) {
            return "Free"
        }
            return 2.99
        }
    },
    mounted() {
      eventBus.$on('review-submitted', productReview => {
        this.reviews.push(productReview)
      })
    }    
  })
  
  Vue.component('product-tabs', {
    props: {
      reviews: {
        type: Array,
        required: true
      }
    },
    template: `
      <div>
        <span class="tab" 
              :class="{ activeTab: selectedTab === tab }"
              v-for="(tab, index) in tabs" 
              :key="index"
              @click="selectedTab = tab">
        {{ tab }}
        </span>


        <div v-show="selectedTab === 'Reviews'">
          <p v-if="!reviews.length">There are no reviews yet.</p>
          <ul>
            <li v-for="review in reviews">
            {{ review.name }}
            <br>Rating: {{ review.rating }}
            <br>{{ review.review }}
            <br>Recommended: {{ review.recommended }}
            </li>
          </ul>              
        </div>

        <div v-show="selectedTab === 'Make a Review'">
          <product-review></product-review>             
        </div>
        
      </div>
    `,
    data() {
      return {
        tabs: ['Reviews', 'Make a Review'],
        selectedTab: 'Reviews'
      }
    }
  })

  Vue.component('info-tabs',{
    props:{
      shipping: {
        type: String,
        required: true
      },
      details: {
        type: Array,
        required: true
      }
    },
    template: `
      <div>
        <span class="tab" 
        :class="{ activeTab: selectedTab === tab }"
        v-for="(tab, index) in tabs" 
        :key="index"
        @click="selectedTab = tab">
        {{ tab }}
        </span>    

        <div v-show="selectedTab ==='Details'">
          <product-details :details="details"></product-details>
        </div>

        <div v-show="selectedTab ==='Shipping'">
          <p>Shipping: {{ shipping }}</p>
        </div>

      </div>
    `,
    data() {
      return {
        tabs: ['Details','Shipping'],
        selectedTab: 'Details'
      }
    },
    
  })

  var app = new Vue({
      el: '#app',
      data: {
        premium: true,
        cart: []
      },
      methods: {
        updateCart(id) {
          this.cart.push(id)
        },
        removeItem(id) {
          for (var i = this.cart.length-1; i >= 0; i--) {
            if (this.cart[i] === id) {
              this.cart.splice(i,1);
            }
          } 
        }
      }
  })